/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VpnConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting'
  | 'error';

export type VpnProtocol = 'VLESS-Reality' | 'Hysteria2' | 'WireGuard' | 'Shadowsocks' | 'SSH';

export interface VpnServer {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  ping: number; // in ms
  load: number; // 0 to 100 percentage
  protocol: VpnProtocol;
  ip: string;
  port: number;
  isVip: boolean;
  isRecommended?: boolean;
  isFavorite?: boolean;
}

export interface VpnStats {
  downSpeed: number; // in KB/s
  upSpeed: number; // in KB/s
  totalDown: number; // in MB
  totalUp: number; // in MB
  durationSeconds: number;
  currentIp: string;
  packetLoss: number; // percentage
  cipher: string;
}

export interface QuickSettings {
  fastMode: boolean; // Connexion optimisée BBR
  dnsProtection: boolean; // Anti-leak DoH
  autoConnect: boolean; // Auto start on boot
  splitTunneling: boolean; // Selected apps
}

export interface AppProfile {
  packageName: string;
  appName: string;
  iconType: string;
  isBypassed: boolean;
}

export interface AtrsConfig {
  version: string;
  configName: string;
  author: string;
  createdAt: string;
  signature: string;
  servers: {
    name: string;
    server: string;
    port: number;
    protocol: VpnProtocol;
    uuidMasked: string;
    network: string;
    tls: boolean;
  }[];
  dns: {
    primary: string;
    fallback: string;
  };
  routing: {
    bypassLan: boolean;
    blockAds: boolean;
  };
}

export interface TokenInfo {
  token: string;
  tier: 'FREE' | 'PRO' | 'VIP_CYBER';
  status: 'active' | 'expired' | 'invalid';
  expiresAt: string;
  maxSpeedMbps: number;
  devicesLimit: number;
  vipServersUnlocked: boolean;
}

export interface VpnNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
}
