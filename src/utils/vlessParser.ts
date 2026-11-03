/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VpnServer, AtrsConfig } from '../types/vpn';

export interface ParsedVlessData {
  isValid: boolean;
  rawInput: string;
  serverName: string;
  host: string;
  port: number;
  uuid: string;
  security: 'reality' | 'tls' | 'none';
  sni: string;
  fingerprint: string;
  publicKey: string;
  shortId: string;
  flow: string;
  networkType: 'tcp' | 'ws' | 'grpc';
  wsPath: string;
  grpcServiceName: string;
  country: string;
  city: string;
  flag: string;
  errorMessage?: string;
}

/**
 * Safe URI component decoder that never throws on unencoded % signs
 */
export function safeDecodeURIComponent(val: string): string {
  if (!val) return '';
  try {
    return decodeURIComponent(val.replace(/\+/g, ' '));
  } catch {
    try {
      // Escape loose % signs and retry
      const sanitized = val.replace(/%(?![0-9a-fA-F]{2})/g, '%25');
      return decodeURIComponent(sanitized.replace(/\+/g, ' '));
    } catch {
      return val;
    }
  }
}

/**
 * Infer flag, country, and city from server name or SNI
 */
export function inferLocationFromText(nameOrSni: string): { country: string; city: string; flag: string; countryCode: string } {
  const lower = nameOrSni.toLowerCase();

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
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('etats-unis') || lower.includes('new york') || lower.includes('🇺🇸') || lower.includes('.us')) {
    return { country: 'États-Unis', city: 'New York', flag: '🇺🇸', countryCode: 'US' };
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
 * Universal safe parser for VLESS URIs (vless://...) or ATRS JSON configs.
 * Guarantees zero unhandled exceptions and robust fallback handling.
 */
export function parseVlessInput(rawInput: string): ParsedVlessData {
  const fallbackResult: ParsedVlessData = {
    isValid: false,
    rawInput,
    serverName: 'Antares VLESS Reality',
    host: '185.190.142.66',
    port: 443,
    uuid: 'b831381d-6324-4d53-ad4f-8cda48b30811',
    security: 'reality',
    sni: 'yahoo.com',
    fingerprint: 'chrome',
    publicKey: '',
    shortId: '',
    flow: 'xtls-rprx-vision',
    networkType: 'tcp',
    wsPath: '/vless-stream',
    grpcServiceName: 'vless-grpc',
    country: 'Cyber Node',
    city: 'Serveur VLESS',
    flag: '⚡',
  };

  if (!rawInput || typeof rawInput !== 'string') {
    return { ...fallbackResult, errorMessage: 'La configuration est vide.' };
  }

  const trimmed = rawInput.trim();

  // 1. Check if the user pasted an ATRS JSON configuration
  if (trimmed.startsWith('{')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      const server = parsedJson.servers?.[0] || parsedJson.vlessPayload || parsedJson;
      const host = server.server || server.host || server.ip || '185.190.142.66';
      const port = parseInt(server.port, 10) || 443;
      const serverName = parsedJson.configName || server.name || 'Configuration ATRS VLESS';
      const loc = inferLocationFromText(serverName + ' ' + (server.sni || ''));

      return {
        isValid: true,
        rawInput,
        serverName,
        host,
        port,
        uuid: server.uuid || server.uuidMasked || 'b831381d-6324-4d53-ad4f-8cda48b30811',
        security: server.security === 'tls' || server.security === 'none' ? server.security : 'reality',
        sni: server.sni || 'yahoo.com',
        fingerprint: server.fingerprint || 'chrome',
        publicKey: server.publicKey || '',
        shortId: server.shortId || '',
        flow: server.flow || 'xtls-rprx-vision',
        networkType: server.network === 'ws' || server.network === 'grpc' ? server.network : 'tcp',
        wsPath: server.wsPath || '/vless-stream',
        grpcServiceName: server.grpcServiceName || 'vless-grpc',
        country: loc.country,
        city: loc.city,
        flag: loc.flag,
      };
    } catch (e: any) {
      return { ...fallbackResult, errorMessage: `Erreur d'analyse JSON ATRS: ${e.message}` };
    }
  }

  // 2. Parse standard vless:// URI
  // Format: vless://[uuid]@[host]:[port]?[params]#[nodeName]
  const vlessPrefix = 'vless://';
  let cleanUri = trimmed;

  // Strip wrapping quotes or markdown backticks if any
  if (cleanUri.startsWith('`') && cleanUri.endsWith('`')) {
    cleanUri = cleanUri.slice(1, -1).trim();
  }
  if (cleanUri.startsWith('"') && cleanUri.endsWith('"')) {
    cleanUri = cleanUri.slice(1, -1).trim();
  }

  if (!cleanUri.toLowerCase().startsWith(vlessPrefix)) {
    return {
      ...fallbackResult,
      errorMessage: 'Le lien doit débuter par "vless://" ou contenir un profil JSON valide.',
    };
  }

  try {
    const afterScheme = cleanUri.substring(vlessPrefix.length);

    // Extract Fragment #name
    let hashFragment = '';
    let mainPart = afterScheme;
    const hashIndex = afterScheme.indexOf('#');
    if (hashIndex !== -1) {
      mainPart = afterScheme.substring(0, hashIndex);
      hashFragment = safeDecodeURIComponent(afterScheme.substring(hashIndex + 1).trim());
    }

    // Extract Query parameters ?key=value
    let queryPart = '';
    let authHostPart = mainPart;
    const queryIndex = mainPart.indexOf('?');
    if (queryIndex !== -1) {
      authHostPart = mainPart.substring(0, queryIndex);
      queryPart = mainPart.substring(queryIndex + 1);
    }

    // Extract UUID and Host:Port (split by @)
    let uuid = '';
    let hostPort = '';

    const atIndex = authHostPart.indexOf('@');
    if (atIndex !== -1) {
      uuid = authHostPart.substring(0, atIndex).trim();
      hostPort = authHostPart.substring(atIndex + 1).trim();
    } else {
      // Missing @: authHostPart might be host:port or uuid
      hostPort = authHostPart.trim();
    }

    // Parse Host and Port (handling IPv6 [::1]:443 or domain:port)
    let host = '185.190.142.66';
    let port = 443;

    if (hostPort.startsWith('[')) {
      // IPv6 notation: [2001:db8::1]:443
      const closingBracket = hostPort.indexOf(']');
      if (closingBracket !== -1) {
        host = hostPort.substring(1, closingBracket);
        const portStr = hostPort.substring(closingBracket + 1).replace(/^:/, '');
        if (portStr) {
          const parsedPort = parseInt(portStr, 10);
          if (!isNaN(parsedPort) && parsedPort > 0) port = parsedPort;
        }
      }
    } else if (hostPort.includes(':')) {
      const lastColon = hostPort.lastIndexOf(':');
      host = hostPort.substring(0, lastColon).trim();
      const portStr = hostPort.substring(lastColon + 1).trim();
      const parsedPort = parseInt(portStr, 10);
      if (!isNaN(parsedPort) && parsedPort > 0) port = parsedPort;
    } else if (hostPort) {
      host = hostPort;
    }

    // Default UUID if not found
    if (!uuid) {
      uuid = 'b831381d-6324-4d53-ad4f-8cda48b30811';
    }

    // Parse Query Params
    let security: 'reality' | 'tls' | 'none' = 'reality';
    let sni = 'yahoo.com';
    let fingerprint = 'chrome';
    let publicKey = '';
    let shortId = '';
    let flow = 'xtls-rprx-vision';
    let networkType: 'tcp' | 'ws' | 'grpc' = 'tcp';
    let wsPath = '/vless-stream';
    let grpcServiceName = 'vless-grpc';

    if (queryPart) {
      try {
        const params = new URLSearchParams(queryPart);
        const secParam = params.get('security');
        if (secParam === 'tls' || secParam === 'none' || secParam === 'reality') {
          security = secParam;
        }

        if (params.get('sni')) sni = safeDecodeURIComponent(params.get('sni')!);
        if (params.get('fp')) fingerprint = safeDecodeURIComponent(params.get('fp')!);
        if (params.get('pbk')) publicKey = safeDecodeURIComponent(params.get('pbk')!);
        if (params.get('sid')) shortId = safeDecodeURIComponent(params.get('sid')!);
        if (params.get('flow')) flow = safeDecodeURIComponent(params.get('flow')!);

        const netType = params.get('type');
        if (netType === 'ws' || netType === 'grpc' || netType === 'tcp') {
          networkType = netType;
        }

        if (params.get('path')) wsPath = safeDecodeURIComponent(params.get('path')!);
        if (params.get('serviceName')) grpcServiceName = safeDecodeURIComponent(params.get('serviceName')!);
      } catch {
        // Continue with defaults
      }
    }

    const serverName = hashFragment || `VLESS ${host}`;
    const loc = inferLocationFromText(serverName + ' ' + sni + ' ' + host);

    return {
      isValid: true,
      rawInput,
      serverName,
      host,
      port,
      uuid,
      security,
      sni,
      fingerprint,
      publicKey,
      shortId,
      flow,
      networkType,
      wsPath,
      grpcServiceName,
      country: loc.country,
      city: loc.city,
      flag: loc.flag,
    };
  } catch (err: any) {
    return {
      ...fallbackResult,
      errorMessage: `Erreur inattendue de décodage : ${err?.message || 'format URI invalide'}`,
    };
  }
}

/**
 * Convert ParsedVlessData into an Antares VpnServer object
 */
export function parsedVlessToVpnServer(data: ParsedVlessData): VpnServer {
  const loc = inferLocationFromText(data.serverName + ' ' + data.sni);
  return {
    id: `vless-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.serverName || 'Serveur VLESS Antares',
    city: data.city || loc.city,
    country: data.country || loc.country,
    countryCode: loc.countryCode,
    flag: data.flag || loc.flag,
    ping: Math.floor(18 + Math.random() * 25),
    load: Math.floor(12 + Math.random() * 28),
    protocol: 'VLESS-Reality',
    ip: data.host,
    port: data.port || 443,
    isVip: true,
    isRecommended: true,
    isFavorite: true,
  };
}

/**
 * Convert ParsedVlessData into a full ATRS configuration
 */
export function parsedVlessToAtrsConfig(data: ParsedVlessData): AtrsConfig {
  const maskedUuid = data.uuid.length > 8
    ? `${data.uuid.substring(0, 4)}••••••••${data.uuid.substring(data.uuid.length - 4)}`
    : '••••••••••••';

  return {
    version: '1.2.0',
    configName: data.serverName || 'Configuration VLESS Antares (.atrs)',
    author: 'Antares Cyber Security',
    createdAt: new Date().toISOString(),
    signature: 'ECDSA-P256-ANTARES-VLESS-VERIFIED',
    servers: [
      {
        name: data.serverName,
        server: data.host,
        port: data.port,
        protocol: 'VLESS-Reality',
        uuidMasked: maskedUuid,
        network: data.networkType,
        tls: data.security !== 'none',
      },
    ],
    dns: {
      primary: '1.1.1.1',
      fallback: '9.9.9.9',
    },
    routing: {
      bypassLan: true,
      blockAds: true,
    },
  };
}
