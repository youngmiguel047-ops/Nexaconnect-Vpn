/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AtrsConfig, 
  VpnServer, 
  VpnProtocol, 
  TransportType, 
  SecurityType, 
  AtrsFileContent, 
  SavedAtrsProfile 
} from '../types/vpn';
import { inferLocationFromText } from './vlessParser';

export interface ParseResult {
  success: boolean;
  config?: AtrsConfig;
  atrsFile?: AtrsFileContent;
  server?: VpnServer;
  servers: VpnServer[];
  configName?: string;
  error?: string;
}

const STORAGE_SAVED_PROFILES_KEY = 'antares_saved_atrs_profiles';

export class AtrsParser {
  public static readonly CURRENT_VERSION = '1.3.0';
  public static readonly ATRS_FORMAT_VERSION = 1;
  public static readonly MAGIC_HEADER = 'ATRS_CYBER_SPEC';

  /**
   * Crée un objet AtrsFileContent officiel selon la spécification propriétaire
   */
  public static createAtrsFile(server: VpnServer, customName?: string): AtrsFileContent {
    const configName = customName || server.name || 'Antares VLESS Configuration';
    return {
      format: 'ATRS',
      version: this.ATRS_FORMAT_VERSION,
      name: configName,
      protocol: server.protocol || 'VLESS',
      createdAt: new Date().toISOString(),
      configuration: {
        server: server.ip,
        port: server.port || 443,
        host: server.wsHost || '',
        sni: server.sni || server.ip,
        path: server.wsPath || '/@abess237',
        uuid: server.uuid || '@abess237',
        transport: server.transport || 'ws',
        security: server.security || 'tls',
        fingerprint: server.fingerprint || 'chrome',
        mux: Boolean(server.mux),
        flow: server.flow || '',
        dns: server.dnsPrimary || '1.1.1.1',
        allowInsecure: Boolean(server.allowInsecure),
        alpn: server.alpn || 'h2,http/1.1',
        publicKey: server.publicKey || '',
        shortId: server.shortId || '',
      },
      metadata: {
        author: 'Antares Cyber Security',
        description: `Profil de configuration propriétaire Antares VPN (.ATRS) pour ${configName}`,
        exportSource: 'Antares VPN Android Client',
        tags: [server.protocol, server.transport || 'ws', 'Antares', 'VLESS'],
      },
    };
  }

  /**
   * Analyse un fichier ou contenu .ATRS (format standard v1 ou multi-serveurs)
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
          return { success: false, servers: [], error: 'Format .ATRS non reconnu ou corrompu (JSON invalide).' };
        }
      }

      // 1. Format Standard Propriétaire Antares (.ATRS v1)
      if (parsedObj.format === 'ATRS' || (parsedObj.configuration && parsedObj.configuration.server)) {
        const version = parsedObj.version || 1;
        if (typeof version === 'number' && version > 2) {
          return { 
            success: false, 
            servers: [], 
            error: `Version de format .ATRS non prise en charge (v${version}). Veuillez mettre à jour Antares VPN.` 
          };
        }

        const cfg = parsedObj.configuration;
        if (!cfg) {
          return { success: false, servers: [], error: 'Le fichier .ATRS ne contient aucun bloc de configuration.' };
        }

        const serverHost = cfg.server || cfg.hostAddress || cfg.ip;
        if (!serverHost) {
          return { success: false, servers: [], error: 'Champ obligatoire manquant dans le fichier .ATRS : adresse du serveur (server).' };
        }

        const serverPort = parseInt(cfg.port, 10) || 443;
        const rawUuid = cfg.uuid || '@abess237';
        const name = parsedObj.name || cfg.name || `Antares VLESS ${serverHost}`;
        const loc = inferLocationFromText(name + ' ' + (cfg.sni || '') + ' ' + serverHost);

        const vlessServer: VpnServer = {
          id: `atrs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name,
          city: loc.city,
          country: loc.country,
          countryCode: loc.countryCode,
          flag: loc.flag,
          ping: 22,
          load: 18,
          protocol: (parsedObj.protocol as VpnProtocol) || (cfg.security === 'reality' ? 'VLESS-Reality' : 'VLESS'),
          ip: serverHost,
          port: serverPort,
          isVip: true,
          isRecommended: true,
          isFavorite: true,

          // Propriétés VLESS essentielles
          uuid: rawUuid,
          transport: (cfg.transport || 'ws') as TransportType,
          wsPath: cfg.path || '/@abess237',
          wsHost: cfg.host || '',
          security: (cfg.security || 'tls') as SecurityType,
          sni: cfg.sni || serverHost,
          fingerprint: cfg.fingerprint || 'chrome',
          flow: cfg.flow || '',
          mux: Boolean(cfg.mux),
          dnsPrimary: cfg.dns || '1.1.1.1',
          dnsSecondary: '8.8.8.8',
          mtu: 1420,
        };

        const maskedUuid = rawUuid.length > 6
          ? `${rawUuid.substring(0, 3)}••••••••${rawUuid.substring(rawUuid.length - 3)}`
          : '••••••••';

        const atrsConfig: AtrsConfig = {
          version: '1.0.0',
          configName: name,
          author: parsedObj.metadata?.author || 'Antares Cyber User',
          createdAt: parsedObj.createdAt || new Date().toISOString(),
          signature: 'ECDSA-P256-ANTARES-ATRS',
          servers: [
            {
              name,
              server: serverHost,
              port: serverPort,
              protocol: vlessServer.protocol,
              uuidMasked: maskedUuid,
              transport: vlessServer.transport,
              security: vlessServer.security,
              tls: vlessServer.security !== 'none',
              wsPath: vlessServer.wsPath,
              wsHost: vlessServer.wsHost,
              sni: vlessServer.sni,
              fingerprint: vlessServer.fingerprint,
              mux: vlessServer.mux,
            },
          ],
          dns: {
            primary: cfg.dns || '1.1.1.1',
            fallback: '8.8.8.8',
          },
          routing: {
            bypassLan: true,
            blockAds: true,
            routingMode: 'global',
            enableIpv4: true,
            enableIpv6: true,
            mtu: 1420,
          },
        };

        const atrsFile: AtrsFileContent = {
          format: 'ATRS',
          version: 1,
          name,
          protocol: vlessServer.protocol,
          createdAt: parsedObj.createdAt || new Date().toISOString(),
          configuration: {
            server: serverHost,
            port: serverPort,
            host: cfg.host || '',
            sni: cfg.sni || serverHost,
            path: cfg.path || '/@abess237',
            uuid: rawUuid,
            transport: vlessServer.transport || 'ws',
            security: vlessServer.security || 'tls',
            fingerprint: vlessServer.fingerprint || 'chrome',
            mux: vlessServer.mux,
            flow: vlessServer.flow,
            dns: cfg.dns || '1.1.1.1',
          },
        };

        return {
          success: true,
          config: atrsConfig,
          atrsFile,
          server: vlessServer,
          servers: [vlessServer],
          configName: name,
        };
      }

      // 2. Format multi-serveurs legacy ou sing-box import
      if (parsedObj.magic && parsedObj.magic !== this.MAGIC_HEADER && !parsedObj.servers) {
        return { success: false, servers: [], error: `Format ATRS incompatible ou corrompu.` };
      }

      const serversList = parsedObj.servers || (parsedObj.vlessPayload ? [parsedObj.vlessPayload] : []);
      if (!Array.isArray(serversList) || serversList.length === 0) {
        return { success: false, servers: [], error: 'Aucun serveur valide trouvé dans ce profil .ATRS.' };
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
        server: validatedServers[0],
        servers: validatedServers,
        configName: config.configName,
      };
    } catch (err: any) {
      return {
        success: false,
        servers: [],
        error: `Erreur d'analyse du fichier .ATRS : ${err.message || 'fichier corrompu'}`,
      };
    }
  }

  /**
   * Enregistre un fichier .ATRS sur le stockage physique Android / Web via sélecteur de fichier
   */
  public static async saveAtrsFileToDisk(
    content: AtrsFileContent | string,
    defaultFileName: string
  ): Promise<{ success: boolean; fileName: string; error?: string }> {
    try {
      // Nettoyage et sécurisation du nom de fichier
      let cleanName = (defaultFileName || 'Antares_Config_01.ATRS').trim();
      if (!cleanName.toLowerCase().endsWith('.atrs')) {
        cleanName = `${cleanName}.ATRS`;
      }

      const jsonString = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

      // Tentative via File System Access API (showSaveFilePicker)
      if (typeof window !== 'undefined' && (window as any).showSaveFilePicker) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: cleanName,
            types: [
              {
                description: 'Fichier de configuration Antares VPN (*.ATRS)',
                accept: {
                  'application/x-atrs': ['.atrs', '.ATRS'],
                  'application/json': ['.json'],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(jsonString);
          await writable.close();

          return { success: true, fileName: handle.name || cleanName };
        } catch (pickErr: any) {
          if (pickErr && pickErr.name === 'AbortError') {
            return { success: false, fileName: cleanName, error: 'Exportation annulée par l\'utilisateur.' };
          }
          // Si showSaveFilePicker échoue (sécurité ou WebView), basculer sur le téléchargement Blob
        }
      }

      // Méthode universelle Blob / Anchor Download
      const blob = new Blob([jsonString], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true, fileName: cleanName };
    } catch (err: any) {
      return { success: false, fileName: defaultFileName, error: err?.message || 'Échec d\'écriture du fichier .ATRS' };
    }
  }

  /**
   * Récupère la liste des profils ATRS sauvegardés en local
   */
  public static getSavedAtrsProfiles(): SavedAtrsProfile[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_PROFILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erreur lecture saved atrs profiles:', e);
    }

    // Profils par défaut de référence
    const defaultProfiles: SavedAtrsProfile[] = [
      {
        id: 'atrs-cameroon-01',
        name: 'Antares Cameroon 01',
        fileName: 'Antares_Cameroon_01.ATRS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        server: {
          id: 'server-cameroon-01',
          name: 'Antares Cameroon 01',
          city: 'Douala',
          country: 'Cameroun',
          countryCode: 'CM',
          flag: '🇨🇲',
          ping: 34,
          load: 22,
          protocol: 'VLESS',
          ip: '192.179.18.100',
          port: 443,
          isVip: true,
          isRecommended: true,
          uuid: '@abess237',
          transport: 'ws',
          wsPath: '/@abess237',
          wsHost: 'abess-ops1-3540044404.us-east4.run.app',
          security: 'tls',
          sni: 'crashlyticsreports-pa.googleapis.com',
          fingerprint: 'chrome',
          mux: true,
          dnsPrimary: '1.1.1.1',
          dnsSecondary: '8.8.8.8',
          mtu: 1420,
        },
        fileContent: {
          format: 'ATRS',
          version: 1,
          name: 'Antares Cameroon 01',
          protocol: 'VLESS',
          createdAt: new Date().toISOString(),
          configuration: {
            server: '192.179.18.100',
            port: 443,
            host: 'abess-ops1-3540044404.us-east4.run.app',
            sni: 'crashlyticsreports-pa.googleapis.com',
            path: '/@abess237',
            uuid: '@abess237',
            transport: 'ws',
            security: 'tls',
            fingerprint: 'chrome',
            mux: true,
            dns: '1.1.1.1',
          },
        },
        isActive: true,
      },
      {
        id: 'atrs-tokyo-stealth-02',
        name: 'Tokyo Stealth Reality',
        fileName: 'Tokyo_Stealth_02.ATRS',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        server: {
          id: 'server-tokyo-stealth-02',
          name: 'Tokyo Stealth Reality',
          city: 'Tokyo',
          country: 'Japon',
          countryCode: 'JP',
          flag: '🇯🇵',
          ping: 18,
          load: 14,
          protocol: 'VLESS-Reality',
          ip: '185.190.142.66',
          port: 443,
          isVip: true,
          isRecommended: true,
          uuid: 'b831381d-6324-4d53-ad4f-8cda48b30811',
          transport: 'tcp',
          wsPath: '/vless-stream',
          wsHost: '',
          security: 'reality',
          sni: 'speed.cloudflare.com',
          fingerprint: 'chrome',
          flow: 'xtls-rprx-vision',
          mux: false,
          dnsPrimary: '1.1.1.1',
          dnsSecondary: '8.8.8.8',
          mtu: 1420,
        },
        fileContent: {
          format: 'ATRS',
          version: 1,
          name: 'Tokyo Stealth Reality',
          protocol: 'VLESS-Reality',
          createdAt: new Date().toISOString(),
          configuration: {
            server: '185.190.142.66',
            port: 443,
            host: '',
            sni: 'speed.cloudflare.com',
            path: '/vless-stream',
            uuid: 'b831381d-6324-4d53-ad4f-8cda48b30811',
            transport: 'tcp',
            security: 'reality',
            fingerprint: 'chrome',
            flow: 'xtls-rprx-vision',
            mux: false,
            dns: '1.1.1.1',
          },
        },
        isActive: false,
      },
    ];

    try {
      localStorage.setItem(STORAGE_SAVED_PROFILES_KEY, JSON.stringify(defaultProfiles));
    } catch {}

    return defaultProfiles;
  }

  /**
   * Sauvegarde ou met à jour un profil ATRS
   */
  public static saveAtrsProfile(data: {
    name: string;
    fileName: string;
    server: VpnServer;
    fileContent?: AtrsFileContent;
  }): SavedAtrsProfile {
    const list = this.getSavedAtrsProfiles();
    const cleanFileName = data.fileName.toLowerCase().endsWith('.atrs')
      ? data.fileName
      : `${data.fileName}.ATRS`;

    const fileContent = data.fileContent || this.createAtrsFile(data.server, data.name);

    const newProfile: SavedAtrsProfile = {
      id: `atrs-prof-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      fileName: cleanFileName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      server: data.server,
      fileContent,
      isActive: false,
    };

    const updated = [newProfile, ...list];
    try {
      localStorage.setItem(STORAGE_SAVED_PROFILES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erreur sauvegarde profil ATRS:', e);
    }
    return newProfile;
  }

  /**
   * Met à jour un profil existant
   */
  public static updateAtrsProfile(id: string, updates: Partial<SavedAtrsProfile>): void {
    const list = this.getSavedAtrsProfiles();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    try {
      localStorage.setItem(STORAGE_SAVED_PROFILES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erreur mise à jour profil ATRS:', e);
    }
  }

  /**
   * Supprime un profil de la liste
   */
  public static deleteAtrsProfile(id: string): void {
    const list = this.getSavedAtrsProfiles();
    const filtered = list.filter((p) => p.id !== id);
    try {
      localStorage.setItem(STORAGE_SAVED_PROFILES_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Erreur suppression profil ATRS:', e);
    }
  }

  /**
   * Marque un profil comme actif
   */
  public static setActiveProfile(id: string): void {
    const list = this.getSavedAtrsProfiles();
    const updated = list.map((item) => ({
      ...item,
      isActive: item.id === id,
    }));
    try {
      localStorage.setItem(STORAGE_SAVED_PROFILES_KEY, JSON.stringify(updated));
    } catch {}
  }
}
