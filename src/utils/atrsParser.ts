/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AtrsConfig, VpnServer } from '../types/vpn';

export interface ParseResult {
  success: boolean;
  config?: AtrsConfig;
  servers: VpnServer[];
  error?: string;
}

export class AtrsParser {
  public static readonly CURRENT_VERSION = '1.2.0';
  public static readonly MAGIC_HEADER = 'ATRS_CYBER_SPEC';

  /**
   * Parse a raw string (.atrs or json) into an AtrsConfig object.
   * Ensures no unmasked private keys or secrets are logged or leaked.
   */
  public static parse(rawContent: string): ParseResult {
    try {
      if (!rawContent || rawContent.trim().length === 0) {
        return { success: false, servers: [], error: 'Le fichier de configuration est vide.' };
      }

      const trimmed = rawContent.trim();
      let parsedObj: any;

      // Handle raw JSON or base64 wrapped ATRS
      if (trimmed.startsWith('{')) {
        parsedObj = JSON.parse(trimmed);
      } else {
        // Try base64 decoding if encoded
        try {
          const decoded = atob(trimmed);
          parsedObj = JSON.parse(decoded);
        } catch {
          return { success: false, servers: [], error: 'Format ATRS non reconnu ou corrompu.' };
        }
      }

      // Check header or version
      if (parsedObj.magic && parsedObj.magic !== this.MAGIC_HEADER) {
        return { success: false, servers: [], error: `En-tête ATRS invalide (attendu: ${this.MAGIC_HEADER}).` };
      }

      if (!parsedObj.servers || !Array.isArray(parsedObj.servers) || parsedObj.servers.length === 0) {
        return { success: false, servers: [], error: 'Aucun serveur valide trouvé dans le profil ATRS.' };
      }

      const validatedServers: VpnServer[] = [];

      for (let i = 0; i < parsedObj.servers.length; i++) {
        const s = parsedObj.servers[i];
        if (!s.server || !s.port) continue;

        // Mask any UUIDs or secrets for safe UI display
        const rawUuid = s.uuid || s.uuidMasked || 'anon-key-token';
        const maskedUuid = rawUuid.length > 8 
          ? `${rawUuid.substring(0, 4)}••••••••${rawUuid.substring(rawUuid.length - 4)}`
          : '••••••••••••';

        s.uuidMasked = maskedUuid;
        // Strip sensitive fields
        delete s.uuid;
        delete s.privateKey;
        delete s.password;

        validatedServers.push({
          id: `atrs-${Date.now()}-${i}`,
          name: s.name || `Serveur ATRS #${i + 1}`,
          city: s.city || 'Tunnel Dédié',
          country: s.country || 'Cyber Node',
          countryCode: s.countryCode || 'XX',
          flag: s.flag || '🛡️',
          ping: s.ping || Math.floor(Math.random() * 30 + 15),
          load: s.load || Math.floor(Math.random() * 40 + 10),
          protocol: s.protocol || 'VLESS-Reality',
          ip: s.server,
          port: s.port,
          isVip: Boolean(s.isVip),
          isRecommended: Boolean(s.isRecommended),
          isFavorite: false,
        });
      }

      if (validatedServers.length === 0) {
        return { success: false, servers: [], error: 'Tous les nœuds du profil comportaient des paramètres invalides.' };
      }

      const config: AtrsConfig = {
        version: parsedObj.version || this.CURRENT_VERSION,
        configName: parsedObj.configName || 'Profil Importé Antares',
        author: parsedObj.author || 'Inconnu',
        createdAt: parsedObj.createdAt || new Date().toISOString(),
        signature: parsedObj.signature || 'ECDSA-SHA256-VALID',
        servers: parsedObj.servers,
        dns: parsedObj.dns || {
          primary: '1.1.1.1',
          fallback: '9.9.9.9',
        },
        routing: parsedObj.routing || {
          bypassLan: true,
          blockAds: true,
        },
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
   * Export an AtrsConfig object into serialized string
   */
  public static exportString(config: AtrsConfig): string {
    const fullObj = {
      magic: this.MAGIC_HEADER,
      ...config,
    };
    return JSON.stringify(fullObj, null, 2);
  }
}
