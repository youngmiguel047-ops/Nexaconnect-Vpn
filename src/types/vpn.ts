/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VpnConnectionState = 
  | 'disconnected'
  | 'initializing'
  | 'connecting'
  | 'tls_handshake'
  | 'websocket_handshake'
  | 'vless_authentication'
  | 'tun_established'
  | 'connected'
  | 'no_traffic'
  | 'connection_error'
  | 'disconnecting'
  | 'error';

export type VpnProtocol = 'VLESS-Reality' | 'VLESS' | 'VMess' | 'Trojan' | 'Shadowsocks' | 'Hysteria2' | 'WireGuard' | 'SSH';

export type TransportType = 'tcp' | 'ws' | 'h2' | 'grpc' | 'httpupgrade' | 'xhttp';
export type SecurityType = 'reality' | 'tls' | 'none';

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

  // A. Informations étendues
  uuid?: string; // Peut être un UUID ou un identifiant personnalisé (ex: @abess237)
  email?: string; // Remarque ou email facultatif

  // B. Transport & Headers
  transport?: TransportType;
  wsPath?: string;
  wsHost?: string; // Header Host (indépendant du SNI)
  customHeaders?: Record<string, string>;

  // C. Sécurité TLS & REALITY
  security?: SecurityType;
  sni?: string; // Server Name Indication
  fingerprint?: string; // fp (chrome, firefox, etc.)
  alpn?: string;
  allowInsecure?: boolean;
  publicKey?: string; // Reality pbk
  shortId?: string; // Reality sid
  spiderX?: string; // Reality spx

  // D. Paramètres VLESS
  flow?: string;
  encryption?: string;
  mux?: boolean;
  muxConcurrency?: number;
  muxMode?: string;

  // E. Réseau et routage
  dnsPrimary?: string;
  dnsSecondary?: string;
  dnsCustom?: string;
  enableIpv4?: boolean;
  enableIpv6?: boolean;
  mtu?: number;
  routingMode?: 'global' | 'bypass_lan' | 'custom';
  bypassLan?: boolean;
  splitTunneling?: boolean;
  includedApps?: string[];
  excludedApps?: string[];

  // F. Options avancées
  connectTimeout?: number;
  readTimeout?: number;
  keepAlive?: number;
  fragmentation?: boolean;
  customJson?: string;
  extraParams?: Record<string, string>;
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
  // Métriques réelles du tunnel IP et VLESS
  packetsIn?: number;
  packetsOut?: number;
  packetsReturned?: number;
  statusMessage?: string;
  diagnosticLogs?: string[];
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
    transport?: TransportType;
    network?: string;
    security?: SecurityType;
    tls?: boolean;
    wsPath?: string;
    wsHost?: string;
    sni?: string;
    fingerprint?: string;
    publicKey?: string;
    shortId?: string;
    flow?: string;
    mux?: boolean;
  }[];
  dns: {
    primary: string;
    fallback: string;
    custom?: string;
  };
  routing: {
    bypassLan: boolean;
    blockAds: boolean;
    routingMode?: 'global' | 'bypass_lan' | 'custom';
    enableIpv4?: boolean;
    enableIpv6?: boolean;
    mtu?: number;
  };
  advanced?: {
    connectTimeout?: number;
    keepAlive?: number;
    extraParams?: Record<string, string>;
  };
}

/**
 * Format standard de fichier propriétaire Antares VPN (.ATRS)
 */
export interface AtrsFileContent {
  format: 'ATRS';
  version: number;
  name: string;
  protocol: VpnProtocol;
  createdAt?: string;
  configuration: {
    server: string;
    port: number;
    host: string; // Header Host (wsHost)
    sni: string; // Server Name Indication
    path: string; // WebSocket Path (wsPath)
    uuid: string; // UUID ou identifiant client
    transport: TransportType;
    security: SecurityType;
    fingerprint?: string;
    mux?: boolean;
    flow?: string;
    dns?: string;
    allowInsecure?: boolean;
    alpn?: string;
    publicKey?: string;
    shortId?: string;
  };
  metadata?: {
    author?: string;
    description?: string;
    exportSource?: string;
    tags?: string[];
  };
}

/**
 * Profil ATRS sauvegardé dans la gestion locale
 */
export interface SavedAtrsProfile {
  id: string;
  name: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  server: VpnServer;
  fileContent: AtrsFileContent;
  isActive?: boolean;
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
