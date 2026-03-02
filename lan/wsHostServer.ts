import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface WsHostServerPlugin {
  start(options: { port: number }): Promise<{ ok: boolean; message?: string; errorCode?: string }>;
  stop(): Promise<{ ok: boolean }>;
  broadcast(options: { message: string }): Promise<{ ok: boolean }>;
  sendToPrimary(options: { message: string }): Promise<{ ok: boolean }>;
  getLocalIp(): Promise<
    | string
    | {
        ok?: boolean;
        ip?: string | null;
        iface?: string;
        source?: string;
        errorCode?: string;
        message?: string;
      }
  >;

  addListener(
    eventName: 'message',
    listenerFunc: (data: { message: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  addListener(
    eventName: 'clientCount',
    listenerFunc: (data: { count: number }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}

export const WsHostServer = registerPlugin<WsHostServerPlugin>('WsHostServer');

const assertWsHostServerAvailable = (methodName?: keyof WsHostServerPlugin) => {
  const plugins = (Capacitor as any)?.Plugins;
  if (!plugins || !plugins.WsHostServer) {
    console.error('[LAN][TS][ERROR] Capacitor.Plugins.WsHostServer missing', {
      hasPlugins: !!plugins,
      pluginKeys: plugins ? Object.keys(plugins) : [],
    });
  }
  if (!Capacitor.isPluginAvailable('WsHostServer')) {
    throw new Error('WsHostServer plugin is not available');
  }
  if (!WsHostServer) {
    throw new Error('WsHostServer plugin is undefined');
  }
  if (methodName && typeof (WsHostServer as any)?.[methodName] !== 'function') {
    throw new Error(`WsHostServer.${String(methodName)} is not a function`);
  }
};

export const startHost = async (port: number) => {
  console.log('[LAN][TS] startHost called');
  try {
    assertWsHostServerAvailable('start');
    const response = await WsHostServer.start({ port });
    console.log('[LAN][TS] plugin response', response);
    return response;
  } catch (error) {
    console.error('[LAN][TS][ERROR]', error);
    throw error;
  }
};

export const stopHost = async () => {
  console.log('[LAN][TS] stopHost called');
  try {
    assertWsHostServerAvailable('stop');
    const response = await WsHostServer.stop();
    console.log('[LAN][TS] plugin response', response);
    return response;
  } catch (error) {
    console.error('[LAN][TS][ERROR]', error);
    throw error;
  }
};

export const sendToPrimary = async (message: string) => {
  try {
    assertWsHostServerAvailable('sendToPrimary');
    return await WsHostServer.sendToPrimary({ message });
  } catch (error) {
    console.error('[LAN][TS][ERROR] sendToPrimary', error);
    return { ok: false };
  }
};

export const getLocalIpWithLogs = async () => {
  console.log('[LAN][TS] getLocalIp request');
  try {
    assertWsHostServerAvailable('getLocalIp');
    const response = await WsHostServer.getLocalIp();
    console.log('[LAN][TS] plugin response', response);
    return response;
  } catch (error) {
    console.error('[LAN][TS][ERROR]', error);
    throw error;
  }
};

export const _isValidLanIp = (ip?: string | null): boolean => {
  if (!ip) return false;
  const trimmed = ip.trim();
  if (!trimmed) return false;
  if (trimmed === '0.0.0.0' || trimmed === '127.0.0.1') return false;

  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;

  const [a, b] = nums;

  // Reject link-local 169.254.0.0/16
  if (a === 169 && b === 254) return false;

  // CGNAT 100.64.0.0/10
  if (a === 100 && b >= 64 && b <= 127) return true;

  // RFC1918 only
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0 – 172.31.255.255
  if (a === 192 && b === 168) return true; // 192.168.0.0/16

  return false;
};
