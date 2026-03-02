import type { PluginListenerHandle } from '@capacitor/core';
import type {
  Transport,
  TransportMessageHandler,
  TransportStatusHandler,
} from './transport.js';
import { WsHostServer, sendToPrimary, startHost } from './wsHostServer.js';

export class HostTransport implements Transport {
  private messageHandler: TransportMessageHandler | null = null;
  private statusHandler: TransportStatusHandler | null = null;
  private connected = false;
  private lastSendErrorAt = 0;

  private messageListener: PluginListenerHandle | null = null;
  private clientCountListener: PluginListenerHandle | null = null;

  private clientCount = 0;
  private port: number;

  // ── Micro-queue + snapshot coalesce ──
  private _sendQueue: string[] = [];
  private _flushScheduled = false;
  private _lastSnapshotIdx = -1;   // queue içinde en son state/state_patch mesajının indexi

  constructor(port: number) {
    this.port = port;
  }

  onMessage(cb: TransportMessageHandler): void {
    this.messageHandler = cb;
  }

  // Optional: consumers (UI) can subscribe to connection status changes
  onStatus(cb: TransportStatusHandler): void {
    this.statusHandler = cb;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getConnectedClientCount(): number {
    return this.clientCount;
  }

  async connect(): Promise<void> {
    this.statusHandler?.({ kind: 'connecting' });

    if (this.connected || this.messageListener || this.clientCountListener) {
      try {
        await this.disconnect();
      } catch {
        // ignore
      }
    }

    const res = await startHost(this.port);
    if (!res.ok) {
      this.connected = false;
      this.statusHandler?.({
        kind: 'error',
        message: res.message || 'Server start failed',
        errorCode: res.errorCode,
      });
      const err = new Error(res.message || 'Server start failed');
      (err as any).errorCode = res.errorCode; // UI can map native errorCode to user-friendly text.
      throw err;
    }

    this.messageListener = await WsHostServer.addListener('message', (data) => {
      if (typeof data?.message === 'string') this.messageHandler?.(data.message);
    });

    this.clientCountListener = await WsHostServer.addListener('clientCount', (data) => {
      if (typeof data?.count === 'number') {
        this.clientCount = data.count;
        this.statusHandler?.({ kind: 'clientCount', count: this.clientCount });
      }
    });

    this.connected = true;
    this.statusHandler?.({ kind: 'connected' });
    // Best-effort initial count
    this.statusHandler?.({ kind: 'clientCount', count: this.clientCount });
  }

  async disconnect(): Promise<void> {
    try {
      await this.messageListener?.remove();
    } catch {
      // ignore
    }
    try {
      await this.clientCountListener?.remove();
    } catch {
      // ignore
    }

    this.messageListener = null;
    this.clientCountListener = null;

    try {
      await WsHostServer.stop();
    } catch {
      // ignore
    }

    this.connected = false;
    this.statusHandler?.({ kind: 'disconnected' });
  }

  send(raw: string): void {
    // Snapshot coalesce: aynı flush içinde birden fazla state/state_patch varsa sadece sonuncuyu gönder
    const isSnapshot = raw.length > 10 && (raw.startsWith('{"t":"state"') || raw.startsWith('{"t":"state_patch"'));
    if (isSnapshot && this._lastSnapshotIdx >= 0 && this._lastSnapshotIdx < this._sendQueue.length) {
      // Önceki snapshot'ı sil, yerine yenisini koy
      this._sendQueue[this._lastSnapshotIdx] = raw;
    } else {
      this._sendQueue.push(raw);
      if (isSnapshot) this._lastSnapshotIdx = this._sendQueue.length - 1;
    }

    if (!this._flushScheduled) {
      this._flushScheduled = true;
      queueMicrotask(() => this._flush());
    }
  }

  private _flush(): void {
    this._flushScheduled = false;
    this._lastSnapshotIdx = -1;
    const batch = this._sendQueue.splice(0);
    for (const raw of batch) {
      this._doSend(raw);
    }
  }

  private _doSend(raw: string): void {
    // host -> primary unicast first, fallback to broadcast
    sendToPrimary(raw)
      .then((res) => {
        if (res?.ok) return;
        return WsHostServer.broadcast({ message: raw }).catch((err) => {
          const now = Date.now();
          if (now - this.lastSendErrorAt > 1000) {
            this.lastSendErrorAt = now;
            console.warn('[LAN] host send failed (primary + broadcast)', err);
            this.statusHandler?.({ kind: 'error', message: 'LAN send failed (primary + broadcast)' });
          }
        });
      })
      .catch((err) => {
        const now = Date.now();
        if (now - this.lastSendErrorAt > 1000) {
          this.lastSendErrorAt = now;
          console.warn('[LAN] host send failed (primary)', err);
          this.statusHandler?.({ kind: 'error', message: 'LAN send failed (primary + broadcast)' });
        }
      });
  }
}
