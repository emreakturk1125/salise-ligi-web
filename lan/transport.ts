export type TransportMessageHandler = (raw: string) => void;
export type TransportStatusHandler = (status: TransportStatus) => void;

export type TransportStatus =
  | { kind: 'disconnected' }
  | { kind: 'connecting' }
  | { kind: 'connected' }
  | { kind: 'clientCount'; count: number }
  | { kind: 'error'; message: string; errorCode?: string };

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(raw: string): void;
  onMessage(cb: TransportMessageHandler): void;
  isConnected(): boolean;
}

export class ClientWebSocketTransport implements Transport {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private messageHandler: TransportMessageHandler | null = null;
  private statusHandler: TransportStatusHandler | null = null;
  private connected = false;
  private wsOpenListener: ((ev: Event) => void) | null = null;
  private wsMessageListener: ((ev: MessageEvent) => void) | null = null;
  private wsCloseListener: ((ev: CloseEvent) => void) | null = null;
  private wsErrorListener: ((ev: Event) => void) | null = null;
  private static readonly CONNECT_TIMEOUT_MS = 5000;

  constructor(url: string) {
    this.url = url;
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

  private _detachListeners(ws: WebSocket) {
    if (this.wsOpenListener) ws.removeEventListener('open', this.wsOpenListener);
    if (this.wsMessageListener) ws.removeEventListener('message', this.wsMessageListener);
    if (this.wsCloseListener) ws.removeEventListener('close', this.wsCloseListener);
    if (this.wsErrorListener) ws.removeEventListener('error', this.wsErrorListener);
    this.wsOpenListener = null;
    this.wsMessageListener = null;
    this.wsCloseListener = null;
    this.wsErrorListener = null;
  }

  async connect(): Promise<void> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.ws) {
      try {
        this._detachListeners(this.ws);
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
      this.connected = false;
    }

    this.statusHandler?.({ kind: 'connecting' });

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      let settled = false;
      let opened = false;
      let timeoutId: number | null = null;

      const cleanupOpen = () => {
        ws.removeEventListener('open', onOpen);
        if (this.wsOpenListener === onOpen) this.wsOpenListener = null;
      };

      const finalize = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      const onOpen = () => {
        if (settled) return;
        opened = true;
        this.connected = true;
        this.statusHandler?.({ kind: 'connected' });
        cleanupOpen();
        this._flushPendingQueue(); // Bağlantı açılınca bekleyen mesajları gönder
        finalize();
      };

      const onMessage = (ev: MessageEvent) => {
        if (typeof ev.data === 'string') this.messageHandler?.(ev.data);
      };

      const onClose = (ev: CloseEvent) => {
        this.connected = false;
        this.statusHandler?.({ kind: 'disconnected' });
        console.warn('[LAN][WS] close', { code: ev.code, reason: ev.reason });
        if (!opened) {
          this.statusHandler?.({
            kind: 'error',
            message: 'WebSocket closed before open',
            errorCode: `CLOSE_BEFORE_OPEN_${ev.code || 0}`,
          });
          if (this.ws === ws) this._detachListeners(ws);
          finalize(new Error(`WebSocket closed before open (${ev.code})`));
          return;
        }
        if (this.ws === ws) this._detachListeners(ws);
      };

      const onError = () => {
        this.connected = false;
        this.statusHandler?.({ kind: 'error', message: 'WebSocket error', errorCode: 'WS_ERROR' });
        if (this.ws === ws) this._detachListeners(ws);
        if (!opened) {
          finalize(new Error('WebSocket error'));
        }
      };

      this.wsOpenListener = onOpen;
      this.wsMessageListener = onMessage;
      this.wsCloseListener = onClose;
      this.wsErrorListener = onError;

      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessage);
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onError);

      timeoutId = window.setTimeout(() => {
        if (settled) return;
        this.connected = false;
        this.statusHandler?.({ kind: 'error', message: 'WebSocket connect timeout', errorCode: 'TIMEOUT' });
        try {
          ws.close();
        } catch {
          // ignore
        }
        if (this.ws === ws) this._detachListeners(ws);
        finalize(new Error('WebSocket connect timeout'));
      }, ClientWebSocketTransport.CONNECT_TIMEOUT_MS);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.ws) return;
    try {
      this._detachListeners(this.ws);
      this.ws.close();
    } catch {
      // ignore
    }
    this.ws = null;
    this.connected = false;
    this.statusHandler?.({ kind: 'disconnected' });
  }

  // ── Outbox: WS hazır değilken mesajları biriktir, açılınca flush et ──
  private _outbox: string[] = [];
  private _maxOutbox = 200;

  send(raw: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Snapshot coalesce: outbox'ta en son state mesajını güncelle, yenisini ekleme
      if (raw.length > 10 && (raw.startsWith('{"t":"state"') || raw.startsWith('{"t":"state_patch"'))) {
        const idx = this._findLastSnapshotIdx();
        if (idx >= 0) {
          this._outbox[idx] = raw;
          return;
        }
      }
      // Kapasite aşılırsa en eskileri at
      while (this._outbox.length >= this._maxOutbox) this._outbox.shift();
      this._outbox.push(raw);
      return;
    }
    this.ws.send(raw);
  }

  /** Outbox'taki en son state/state_patch mesajının index'ini bul */
  private _findLastSnapshotIdx(): number {
    for (let i = this._outbox.length - 1; i >= 0; i--) {
      const r = this._outbox[i];
      if (r.startsWith('{"t":"state"') || r.startsWith('{"t":"state_patch"')) return i;
    }
    return -1;
  }

  private _flushPendingQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const batch = this._outbox.splice(0);
    for (const raw of batch) {
      try {
        this.ws.send(raw);
      } catch {
        // Hata olursa kalanları geri koy, sonraki reconnect'te devam etsin
        this._outbox.unshift(...batch.slice(batch.indexOf(raw)));
        break;
      }
    }
  }
}
