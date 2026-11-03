/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VpnServer, AtrsConfig, TransportType, SecurityType, VpnProtocol } from '../types/vpn';

export interface ParsedVlessData {
  isValid: boolean;
  rawInput: string;
  serverName: string;
  host: string;
  port: number;
  uuid: string; // Identifiant ou UUID (ex: @abess237)
  email?: string;
  protocol: VpnProtocol;
  transport: TransportType;
  wsPath: string;
  wsHost: string; // Header Host indépendant du SNI
  customHeaders?: Record<string, string>;
  security: SecurityType;
  sni: string;
  fingerprint: string;
  alpn: string;
  allowInsecure: boolean;
  publicKey: string; // pbk
  shortId: string; // sid
  spiderX: string; // spx
  flow: string;
  mux: boolean;
  muxConcurrency: number;
  grpcServiceName: string;
  country: string;
  city: string;
  flag: string;
  dnsPrimary: string;
  dnsSecondary: string;
  mtu: number;
  extraParams: Record<string, string>;
  errorMessage?: string;
}

/**
 * Profil de référence Dark Tunnel (@abess237)
 */
export const DARK_TUNNEL_REFERENCE_PROFILE: ParsedVlessData = {
  isValid: true,
  rawInput: 'vless://@abess237@192.179.18.100:443?type=ws&security=tls&sni=crashlyticsreports-pa.googleapis.com&host=abess-ops1-3540044404.us-east4.run.app&path=%2F%40abess237&fp=chrome&mux=1#Dark%20Tunnel%20Reference',
  serverName: 'Dark Tunnel Reference (USA)',
  host: '192.179.18.100',
  port: 443,
  uuid: '@abess237',
  email: 'abess237@darktunnel.net',
  protocol: 'VLESS',
  transport: 'ws',
  wsPath: '/@abess237',
  wsHost: 'abess-ops1-3540044404.us-east4.run.app',
  customHeaders: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  security: 'tls',
  sni: 'crashlyticsreports-pa.googleapis.com',
  fingerprint: 'chrome',
  alpn: 'http/1.1',
  allowInsecure: false,
  publicKey: '',
  shortId: '',
  spiderX: '',
  flow: '',
  mux: true,
  muxConcurrency: 8,
  grpcServiceName: '',
  country: 'États-Unis',
  city: 'Council Bluffs',
  flag: '🇺🇸',
  dnsPrimary: '1.1.1.1',
  dnsSecondary: '8.8.8.8',
  mtu: 1420,
  extraParams: {
    source: 'Dark Tunnel Import',
  },
};

/**
 * Décodeur URI sûr évitant le double-décodage et ne levant jamais d'exception
 */
export function safeDecodeURIComponent(val: string): string {
  if (!val) return '';
  try {
    return decodeURIComponent(val.replace(/\+/g, ' '));
  } catch {
    try {
      const sanitized = val.replace(/%(?![0-9a-fA-F]{2})/g, '%25');
      return decodeURIComponent(sanitized.replace(/\+/g, ' '));
    } catch {
      return val;
    }
  }
}

/**
 * Déduction automatique de l'emplacement et du drapeau
 */
export function inferLocationFromText(nameOrSni: string): { country: string; city: string; flag: string; countryCode: string } {
  const lower = (nameOrSni || '').toLowerCase();

  if (lower.includes('france') || lower.includes('paris') || lower.includes('🇫🇷') || lower.includes('.fr') || lower.includes('cdg')) {
    return { country: 'France', city: 'Paris', flag: '🇫🇷', countryCode: 'FR' };
  }
  if (lower.includes('germany') || lower.includes('allemagne') || lower.includes('frankfurt') || lower.includes('francfort') || lower.includes('🇩🇪') || lower.includes('.de')) {
    return { country: 'Allemagne', city: 'Francfort', flag: '🇩🇪', countryCode: 'DE' };
  }
  if (lower.includes('japan') || lower.includes('japon') || lower.includes('tokyo') || lower.includes('🇯🇵') || lower.includes('.jp')) {
    return { country: 'Japon', city: 'Tokyo', flag: '🇯🇵', countryCode: 'JP' };
  }
  if (lower.includes('switzerland') || lower.includes('suisse') || lower.includes('zurich') || lower.includes('🇨🇭') || lower.includes('.ch')) {
    return { country: 'Suisse', city: 'Zurich', flag: '🇨🇭', countryCode: 'CH' };
  }
  if (lower.includes('netherlands') || lower.includes('pays-bas') || lower.includes('amsterdam') || lower.includes('🇳🇱') || lower.includes('.nl')) {
    return { country: 'Pays-Bas', city: 'Amsterdam', flag: '🇳🇱', countryCode: 'NL' };
  }
  if (lower.includes('united kingdom') || lower.includes('royaume-uni') || lower.includes('london') || lower.includes('londres') || lower.includes('🇬🇧') || lower.includes('.uk')) {
    return { country: 'Royaume-Uni', city: 'Londres', flag: '🇬🇧', countryCode: 'GB' };
  }
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('etats-unis') || lower.includes('new york') || lower.includes('🇺🇸') || lower.includes('.us') || lower.includes('run.app')) {
    return { country: 'États-Unis', city: 'Virginia (US-East)', flag: '🇺🇸', countryCode: 'US' };
  }
  if (lower.includes('singapore') || lower.includes('singapour') || lower.includes('🇸🇬') || lower.includes('.sg')) {
    return { country: 'Singapour', city: 'Singapour', flag: '🇸🇬', countryCode: 'SG' };
  }
  if (lower.includes('canada') || lower.includes('montreal') || lower.includes('🇨🇦') || lower.includes('.ca')) {
    return { country: 'Canada', city: 'Montréal', flag: '🇨🇦', countryCode: 'CA' };
  }

  return { country: 'Cyber Node', city: 'Serveur VLESS', flag: '⚡', countryCode: 'CFG' };
}

/**
 * Parseur VLESS universel prenant en charge les URIs VLESS,
 * les configurations JSON ATRS et les identifiants libres (Dark Tunnel @abess237)
 */
export function parseVlessInput(rawInput: string): ParsedVlessData {
  const fallbackResult: ParsedVlessData = {
    isValid: false,
    rawInput,
    serverName: 'Antares VLESS Reality',
    host: '185.190.142.66',
    port: 443,
    uuid: 'b831381d-6324-4d53-ad4f-8cda48b30811',
    protocol: 'VLESS-Reality',
    transport: 'tcp',
    wsPath: '/vless-stream',
    wsHost: '',
    security: 'reality',
    sni: 'yahoo.com',
    fingerprint: 'chrome',
    alpn: 'h2,http/1.1',
    allowInsecure: false,
    publicKey: '',
    shortId: '',
    spiderX: '',
    flow: 'xtls-rprx-vision',
    mux: false,
    muxConcurrency: 8,
    grpcServiceName: 'vless-grpc',
    country: 'Cyber Node',
    city: 'Serveur VLESS',
    flag: '⚡',
    dnsPrimary: '1.1.1.1',
    dnsSecondary: '8.8.8.8',
    mtu: 1420,
    extraParams: {},
  };

  if (!rawInput || typeof rawInput !== 'string') {
    return { ...fallbackResult, errorMessage: 'La chaîne de configuration fournie est vide.' };
  }

  const trimmed = rawInput.trim();

  // 1. Analyse si format JSON (ATRS ou export sing-box/xray)
  if (trimmed.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const server = parsedJson.servers?.[0] || parsedJson.vlessPayload || parsedJson;
      const host = server.server || server.host || server.ip || '185.190.142.66';
      const port = parseInt(server.port, 10) || 443;
      const serverName = parsedJson.configName || server.name || 'Configuration ATRS VLESS';
      const loc = inferLocationFromText(serverName + ' ' + (server.sni || '') + ' ' + host);

      const transport: TransportType =
        server.transport === 'ws' || server.network === 'ws'
          ? 'ws'
          : server.transport === 'grpc' || server.network === 'grpc'
          ? 'grpc'
          : server.transport === 'h2' || server.network === 'h2'
          ? 'h2'
          : server.transport === 'httpupgrade'
          ? 'httpupgrade'
          : server.transport === 'xhttp'
          ? 'xhttp'
          : 'tcp';

      const security: SecurityType =
        server.security === 'tls' || server.tls === true
          ? 'tls'
          : server.security === 'none'
          ? 'none'
          : 'reality';

      return {
        isValid: true,
        rawInput,
        serverName,
        host,
        port,
        uuid: server.uuid || server.uuidMasked || '@abess237',
        protocol: (server.protocol as VpnProtocol) || (security === 'reality' ? 'VLESS-Reality' : 'VLESS'),
        transport,
        wsPath: server.wsPath || server.path || (transport === 'ws' ? '/@abess237' : '/vless-stream'),
        wsHost: server.wsHost || server.hostHeader || '',
        customHeaders: server.customHeaders || {},
        security,
        sni: server.sni || server.serverName || 'yahoo.com',
        fingerprint: server.fingerprint || 'chrome',
        alpn: server.alpn || 'h2,http/1.1',
        allowInsecure: Boolean(server.allowInsecure),
        publicKey: server.publicKey || '',
        shortId: server.shortId || '',
        spiderX: server.spiderX || '',
        flow: server.flow || (security === 'reality' ? 'xtls-rprx-vision' : ''),
        mux: Boolean(server.mux),
        muxConcurrency: server.muxConcurrency || 8,
        grpcServiceName: server.grpcServiceName || 'vless-grpc',
        country: loc.country,
        city: loc.city,
        flag: loc.flag,
        dnsPrimary: parsedJson.dns?.primary || '1.1.1.1',
        dnsSecondary: parsedJson.dns?.fallback || '8.8.8.8',
        mtu: parsedJson.routing?.mtu || 1420,
        extraParams: parsedJson.advanced?.extraParams || {},
      };
    } catch (e: any) {
      return { ...fallbackResult, errorMessage: `Erreur d'analyse JSON ATRS : ${e.message}` };
    }
  }

  // 2. Analyse URI standard vless://[uuid]@[host]:[port]?[query]#[name]
  const vlessPrefix = 'vless://';
  let cleanUri = trimmed;

  if (cleanUri.startsWith('`') && cleanUri.endsWith('`')) cleanUri = cleanUri.slice(1, -1).trim();
  if (cleanUri.startsWith('"') && cleanUri.endsWith('"')) cleanUri = cleanUri.slice(1, -1).trim();

  if (!cleanUri.toLowerCase().startsWith(vlessPrefix)) {
    return {
      ...fallbackResult,
      errorMessage: 'Le lien doit impérativement débuter par "vless://" ou contenir du JSON ATRS.',
    };
  }

  try {
    const afterScheme = cleanUri.substring(vlessPrefix.length);

    // Extraction du fragment #nom
    let hashFragment = '';
    let mainPart = afterScheme;
    const hashIndex = afterScheme.indexOf('#');
    if (hashIndex !== -1) {
      mainPart = afterScheme.substring(0, hashIndex);
      hashFragment = safeDecodeURIComponent(afterScheme.substring(hashIndex + 1).trim());
    }

    // Extraction des paramètres ?cle=valeur
    let queryPart = '';
    let authHostPart = mainPart;
    const queryIndex = mainPart.indexOf('?');
    if (queryIndex !== -1) {
      authHostPart = mainPart.substring(0, queryIndex);
      queryPart = mainPart.substring(queryIndex + 1);
    }

    // Extraction UUID et Host:Port
    let uuid = '';
    let hostPort = '';

    // Trouver le séparateur @ de l'hôte
    // ATTENTION : Pour un identifiant comme @abess237, la chaîne peut être :
    // vless://@abess237@192.179.18.100:443
    // Le DERNIER caractère '@' sépare l'identifiant et l'hôte !
    const lastAtIndex = authHostPart.lastIndexOf('@');
    if (lastAtIndex > 0) {
      uuid = authHostPart.substring(0, lastAtIndex).trim();
      hostPort = authHostPart.substring(lastAtIndex + 1).trim();
    } else if (lastAtIndex === 0) {
      // Cas où l'identifiant commence par @ et il y a un second @
      const secondAtIndex = authHostPart.indexOf('@', 1);
      if (secondAtIndex !== -1) {
        uuid = authHostPart.substring(0, secondAtIndex).trim();
        hostPort = authHostPart.substring(secondAtIndex + 1).trim();
      } else {
        uuid = authHostPart.trim();
      }
    } else {
      hostPort = authHostPart.trim();
    }

    // Traitement Hôte et Port (support IPv6 [::1]:443 ou IP/domaine classique)
    let host = '185.190.142.66';
    let port = 443;

    if (hostPort.startsWith('[')) {
      const closingBracket = hostPort.indexOf(']');
      if (closingBracket !== -1) {
        host = hostPort.substring(1, closingBracket);
        const portStr = hostPort.substring(closingBracket + 1).replace(/^:/, '');
        if (portStr) {
          const p = parseInt(portStr, 10);
          if (!isNaN(p) && p > 0) port = p;
        }
      }
    } else if (hostPort.includes(':')) {
      const lastColon = hostPort.lastIndexOf(':');
      host = hostPort.substring(0, lastColon).trim();
      const portStr = hostPort.substring(lastColon + 1).trim();
      const p = parseInt(portStr, 10);
      if (!isNaN(p) && p > 0) port = p;
    } else if (hostPort) {
      host = hostPort;
    }

    if (!uuid) {
      uuid = '@abess237';
    }

    // Décodage des Query Params
    let security: SecurityType = 'reality';
    let sni = '';
    let fingerprint = 'chrome';
    let alpn = 'h2,http/1.1';
    let allowInsecure = false;
    let publicKey = '';
    let shortId = '';
    let spiderX = '';
    let flow = '';
    let transport: TransportType = 'tcp';
    let wsPath = '/vless-stream';
    let wsHost = '';
    let grpcServiceName = '';
    let mux = false;
    let muxConcurrency = 8;
    const extraParams: Record<string, string> = {};

    if (queryPart) {
      const pairs = queryPart.split('&');
      for (const pair of pairs) {
        if (!pair) continue;
        const eqIdx = pair.indexOf('=');
        const rawKey = eqIdx !== -1 ? pair.substring(0, eqIdx) : pair;
        const rawVal = eqIdx !== -1 ? pair.substring(eqIdx + 1) : '';
        const key = safeDecodeURIComponent(rawKey).trim().toLowerCase();
        const val = safeDecodeURIComponent(rawVal).trim();

        switch (key) {
          case 'security':
            if (val === 'tls' || val === 'none' || val === 'reality') security = val;
            break;
          case 'sni':
            sni = val;
            break;
          case 'fp':
          case 'fingerprint':
            fingerprint = val;
            break;
          case 'alpn':
            alpn = val;
            break;
          case 'allowinsecure':
          case 'insecure':
            allowInsecure = val === '1' || val.toLowerCase() === 'true';
            break;
          case 'pbk':
          case 'publickey':
            publicKey = val;
            break;
          case 'sid':
          case 'shortid':
            shortId = val;
            break;
          case 'spx':
          case 'spiderx':
            spiderX = val;
            break;
          case 'flow':
            flow = val;
            break;
          case 'type':
          case 'net':
          case 'network':
            if (val === 'ws' || val === 'grpc' || val === 'tcp' || val === 'h2' || val === 'httpupgrade' || val === 'xhttp') {
              transport = val;
            }
            break;
          case 'path':
            wsPath = val;
            break;
          case 'host':
            // Le Header Host est indépendant du SNI
            wsHost = val;
            break;
          case 'servicename':
            grpcServiceName = val;
            break;
          case 'mux':
            mux = val === '1' || val.toLowerCase() === 'true';
            break;
          case 'concurrency':
            const c = parseInt(val, 10);
            if (!isNaN(c)) muxConcurrency = c;
            break;
          default:
            // Conserver les paramètres inconnus dans les métadonnées
            extraParams[key] = val;
            break;
        }
      }
    }

    // Réconciliation par défaut intelligente
    if (!sni) {
      sni = host;
    }
    if (security === 'reality' && !flow) {
      flow = 'xtls-rprx-vision';
    }

    const serverName = hashFragment || `VLESS ${host}`;
    const loc = inferLocationFromText(serverName + ' ' + sni + ' ' + host);

    const protocol: VpnProtocol = security === 'reality' ? 'VLESS-Reality' : 'VLESS';

    return {
      isValid: true,
      rawInput,
      serverName,
      host,
      port,
      uuid,
      protocol,
      transport,
      wsPath,
      wsHost,
      security,
      sni,
      fingerprint,
      alpn,
      allowInsecure,
      publicKey,
      shortId,
      spiderX,
      flow,
      mux,
      muxConcurrency,
      grpcServiceName,
      country: loc.country,
      city: loc.city,
      flag: loc.flag,
      dnsPrimary: '1.1.1.1',
      dnsSecondary: '8.8.8.8',
      mtu: 1420,
      extraParams,
    };
  } catch (err: any) {
    return {
      ...fallbackResult,
      errorMessage: `Erreur inattendue de décodage : ${err?.message || 'format URI invalide'}`,
    };
  }
}

/**
 * Convertit ParsedVlessData en objet VpnServer complet pour Antares
 */
export function parsedVlessToVpnServer(data: ParsedVlessData): VpnServer {
  const loc = inferLocationFromText(data.serverName + ' ' + data.sni + ' ' + data.host);
  return {
    id: `vless-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.serverName || 'Serveur VLESS Antares',
    city: data.city || loc.city,
    country: data.country || loc.country,
    countryCode: loc.countryCode,
    flag: data.flag || loc.flag,
    ping: Math.floor(18 + Math.random() * 25),
    load: Math.floor(12 + Math.random() * 28),
    protocol: data.protocol,
    ip: data.host,
    port: data.port || 443,
    isVip: true,
    isRecommended: true,
    isFavorite: true,

    // Propriétés VLESS
    uuid: data.uuid,
    email: data.email,
    transport: data.transport,
    wsPath: data.wsPath,
    wsHost: data.wsHost,
    customHeaders: data.customHeaders,
    security: data.security,
    sni: data.sni,
    fingerprint: data.fingerprint,
    alpn: data.alpn,
    allowInsecure: data.allowInsecure,
    publicKey: data.publicKey,
    shortId: data.shortId,
    spiderX: data.spiderX,
    flow: data.flow,
    mux: data.mux,
    muxConcurrency: data.muxConcurrency,
    dnsPrimary: data.dnsPrimary,
    dnsSecondary: data.dnsSecondary,
    mtu: data.mtu,
    extraParams: data.extraParams,
  };
}

/**
 * Convertit ParsedVlessData en configuration .ATRS standardisée
 */
export function parsedVlessToAtrsConfig(data: ParsedVlessData): AtrsConfig {
  const maskedUuid = data.uuid.length > 6
    ? `${data.uuid.substring(0, 3)}••••••••${data.uuid.substring(data.uuid.length - 3)}`
    : '••••••••';

  return {
    version: '1.3.0',
    configName: data.serverName || 'Configuration VLESS Antares (.atrs)',
    author: 'Antares Cyber Security',
    createdAt: new Date().toISOString(),
    signature: 'ECDSA-P256-ANTARES-VLESS-VERIFIED',
    servers: [
      {
        name: data.serverName,
        server: data.host,
        port: data.port,
        protocol: data.protocol,
        uuidMasked: maskedUuid,
        transport: data.transport,
        network: data.transport,
        security: data.security,
        tls: data.security !== 'none',
        wsPath: data.wsPath,
        wsHost: data.wsHost,
        sni: data.sni,
        fingerprint: data.fingerprint,
        publicKey: data.publicKey,
        shortId: data.shortId,
        flow: data.flow,
        mux: data.mux,
      },
    ],
    dns: {
      primary: data.dnsPrimary || '1.1.1.1',
      fallback: data.dnsSecondary || '8.8.8.8',
    },
    routing: {
      bypassLan: true,
      blockAds: true,
      routingMode: 'global',
      enableIpv4: true,
      enableIpv6: true,
      mtu: data.mtu || 1420,
    },
    advanced: {
      connectTimeout: 5000,
      keepAlive: 15,
      extraParams: data.extraParams,
    },
  };
}
