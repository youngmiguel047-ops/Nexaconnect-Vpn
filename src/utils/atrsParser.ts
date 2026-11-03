/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AtrsConfig, VpnServer, VpnProtocol, TransportType, SecurityType } from '../types/vpn';
import { inferLocationFromText } from './vlessParser';

export interface ParseResult {
  success: boolean;
  config?: AtrsConfig;
  servers: VpnServer[];
  error?: string;
}

export class AtrsParser {
  public static readonly CURRENT_VERSION = '1.3.0';
  public static readonly MAGIC_HEADER = 'ATRS_CYBER_SPEC';

  /**
   * Parse une chaîne brute (.atrs ou json) en profil AtrsConfig et liste de serveurs
   */
  public static parse(rawContent: string): ParseResult {
    try {
      if (!rawContent || rawContent.trim().length === 0) {
        return { success: false, servers: [], error: 'Le fichier de configuration est vide.' };
      }

      const trimmed = rawContent.trim();
      let parsedObj: any;

      if (trimmed.startsWith('{')) {
        parsedObj = JSON.parse(trimmed);
      } else {
        try {
          const decoded = atob(trimmed);
          parsedObj = JSON.parse(decoded);
        } catch {
          return { success: false, servers: [], error: 'Format ATRS non reconnu ou corrompu.' };
        }
      }

      if (parsedObj.magic && parsedObj.magic !== this.MAGIC_HEADER) {
        return { success: false, servers: [], error: `En-tête ATRS non conforme (attendu: ${this.MAGIC_HEADER}).` };
      }

      const serversList = parsedObj.servers || (parsedObj.vlessPayload ? [parsedObj.vlessPayload] : []);
      if (!Array.isArray(serversList) || serversList.length === 0) {
        return { success: false, servers: [], error: 'Aucun serveur valide trouvé dans le profil ATRS.' };
      }

      const validatedServers: VpnServer[] = [];

      for (let i = 0; i < serversList.length; i++) {
        const s = serversList[i];
        const serverHost = s.server || s.host || s.ip;
        const serverPort = parseInt(s.port, 10) || 443;
        if (!serverHost) continue;

        const rawUuid = s.uuid || s.uuidMasked || '@abess237';
        const maskedUuid = rawUuid.length > 6
          ? `${rawUuid.substring(0, 3)}••••••••${rawUuid.substring(rawUuid.length - 3)}`
          : '••••••••';

        s.uuidMasked = maskedUuid;

        const loc = inferLocationFromText((s.name || '') + ' ' + (s.sni || '') + ' ' + serverHost);

        validatedServers.push({
          id: `atrs-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
          name: s.name || `Serveur ATRS #${i + 1}`,
          city: s.city || loc.city,
          country: s.country || loc.country,
          countryCode: s.countryCode || loc.countryCode,
          flag: s.flag || loc.flag,
          ping: s.ping || Math.floor(Math.random() * 30 + 15),
          load: s.load || Math.floor(Math.random() * 40 + 10),
          protocol: (s.protocol as VpnProtocol) || (s.security === 'reality' ? 'VLESS-Reality' : 'VLESS'),
          ip: serverHost,
          port: serverPort,
          isVip: Boolean(s.isVip ?? true),
          isRecommended: Boolean(s.isRecommended ?? true),
          isFavorite: false,

          // Propriétés VLESS
          uuid: rawUuid,
          transport: (s.transport || s.network || 'ws') as TransportType,
          wsPath: s.wsPath || s.path || '/@abess237',
          wsHost: s.wsHost || s.hostHeader || '',
          security: (s.security || (s.tls ? 'tls' : 'reality')) as SecurityType,
          sni: s.sni || '',
          fingerprint: s.fingerprint || 'chrome',
          alpn: s.alpn || 'h2,http/1.1',
          allowInsecure: Boolean(s.allowInsecure),
          publicKey: s.publicKey || '',
          shortId: s.shortId || '',
          flow: s.flow || '',
          mux: Boolean(s.mux),
          dnsPrimary: parsedObj.dns?.primary || '1.1.1.1',
          dnsSecondary: parsedObj.dns?.fallback || '8.8.8.8',
          mtu: parsedObj.routing?.mtu || 1420,
        });
      }

      if (validatedServers.length === 0) {
        return { success: false, servers: [], error: 'Tous les nœuds du profil comportaient des paramètres invalides.' };
      }

      const config: AtrsConfig = {
        version: parsedObj.version || this.CURRENT_VERSION,
        configName: parsedObj.configName || 'Profil Importé Antares',
        author: parsedObj.author || 'Antares Cyber Security',
        createdAt: parsedObj.createdAt || new Date().toISOString(),
        signature: parsedObj.signature || 'ECDSA-P256-ANTARES-VERIFIED',
        servers: parsedObj.servers || [],
        dns: parsedObj.dns || {
          primary: '1.1.1.1',
          fallback: '8.8.8.8',
        },
        routing: parsedObj.routing || {
          bypassLan: true,
          blockAds: true,
          routingMode: 'global',
          enableIpv4: true,
          enableIpv6: true,
          mtu: 1420,
        },
        advanced: parsedObj.advanced,
      };

      return {
        success: true,
        config,
        servers: validatedServers,
      };
    } catch (err: any) {
      return {
        success: false,
        servers: [],
        error: `Erreur de syntaxe du profil : ${err.message || 'fichier corrompu'}`,
      };
    }
  }

  /**
   * Sérialise une configuration ATRS complète avec métadonnées VLESS
   */
  public static exportString(config: AtrsConfig, vlessPayload?: Partial<VpnServer>): string {
    const fullObj = {
      magic: this.MAGIC_HEADER,
      ...config,
      ...(vlessPayload
        ? {
            vlessPayload: {
              server: vlessPayload.ip,
              port: vlessPayload.port,
              uuid: vlessPayload.uuid,
              protocol: vlessPayload.protocol,
              transport: vlessPayload.transport,
              wsPath: vlessPayload.wsPath,
              wsHost: vlessPayload.wsHost,
              security: vlessPayload.security,
              sni: vlessPayload.sni,
              fingerprint: vlessPayload.fingerprint,
              alpn: vlessPayload.alpn,
              allowInsecure: vlessPayload.allowInsecure,
              publicKey: vlessPayload.publicKey,
              shortId: vlessPayload.shortId,
              flow: vlessPayload.flow,
              mux: vlessPayload.mux,
            },
          }
        : {}),
    };
    return JSON.stringify(fullObj, null, 2);
  }

  /**
   * Duplique un serveur VpnServer existant
   */
  public static duplicateServer(server: VpnServer): VpnServer {
    return {
      ...server,
      id: `server-copy-${Date.now()}`,
      name: `${server.name} (Copie)`,
      isFavorite: false,
    };
  }

  /**
   * Supprime un serveur de la liste
   */
  public static deleteServer(servers: VpnServer[], idToDelete: string): VpnServer[] {
    return servers.filter((s) => s.id !== idToDelete);
  }
}
