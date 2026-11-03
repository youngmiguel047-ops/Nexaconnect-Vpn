/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Loader2, AlertTriangle, Activity } from 'lucide-react';
import { VpnConnectionState, VpnServer } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface ProtectionCardProps {
  state: VpnConnectionState;
  activeServer: VpnServer;
  realIp?: string;
  protectedIp?: string;
  onOpenDiagnostics?: () => void;
}

export const ProtectionCard: React.FC<ProtectionCardProps> = ({
  state,
  activeServer,
  realIp = '82.64.120.45',
  protectedIp,
  onOpenDiagnostics,
}) => {
  const isConnected = state === 'connected';
  const isNoTraffic = state === 'no_traffic';
  const isHandshake = [
    'connecting',
    'initializing',
    'tls_handshake',
    'websocket_handshake',
    'vless_authentication',
    'tun_established',
  ].includes(state);
  const isError = state === 'error' || state === 'connection_error';

  const getStatusTitle = () => {
    switch (state) {
      case 'connected':
        return <span>Votre connexion est <span className="text-[#00FF88] text-glow-green">protégée</span></span>;
      case 'no_traffic':
        return <span>Tunnel établi — <span className="text-amber-400">aucun trafic détecté</span></span>;
      case 'tls_handshake':
        return <span>Négociation TLS / SNI <span className="text-[#00E5FF] text-glow-cyan">en cours...</span></span>;
      case 'websocket_handshake':
        return <span>Handshake WebSocket <span className="text-[#00E5FF] text-glow-cyan">en cours...</span></span>;
      case 'vless_authentication':
        return <span>Authentification VLESS <span className="text-[#00E5FF] text-glow-cyan">en cours...</span></span>;
      case 'tun_established':
        return <span>Interface TUN active <span className="text-[#00E5FF] text-glow-cyan">vérification...</span></span>;
      case 'connecting':
      case 'initializing':
        return <span>Connexion <span className="text-[#00E5FF] text-glow-cyan">en cours...</span></span>;
      case 'connection_error':
      case 'error':
        return <span>Connexion <span className="text-[#FF3155] text-glow-red">échouée</span></span>;
      case 'disconnecting':
        return <span>Déconnexion <span className="text-slate-400">en cours...</span></span>;
      default:
        return <span>Connexion <span className="text-slate-400">non protégée</span></span>;
    }
  };

  const getStatusSubtitle = () => {
    switch (state) {
      case 'connected':
        return 'Naviguez en toute sécurité • Trafic bidirectionnel actif';
      case 'no_traffic':
        return 'Le serveur VLESS distant ne renvoie aucun paquet (0 octet)';
      case 'tls_handshake':
        return `Négociation TLS 1.3 avec ${activeServer.sni || activeServer.ip}`;
      case 'websocket_handshake':
        return `Upgrade HTTP/101 sur ${activeServer.wsPath || '/@abess237'}`;
      case 'vless_authentication':
        return `Validation de l'UUID client sur ${activeServer.ip}`;
      case 'tun_established':
        return 'TUN configuré • Envoi de la requête de test de connectivité';
      case 'connecting':
      case 'initializing':
        return `Établissement du socket vers ${activeServer.ip}:${activeServer.port}`;
      case 'connection_error':
      case 'error':
        return 'Serveur injoignable, timeout ou certificat TLS rejeté';
      case 'disconnecting':
        return 'Fermeture sécurisée du service et libération du TUN';
      default:
        return `IP réelle visible: ${realIp}`;
    }
  };

  return (
    <div className={`relative mx-1 p-[1px] bg-gradient-to-r cyber-chamfer-md select-none transition-all ${
      isConnected
        ? 'from-[#00FF88] via-[#00E5FF] to-[#8B00FF] shadow-[0_0_20px_rgba(0,255,136,0.3)]'
        : isNoTraffic
        ? 'from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
        : isError
        ? 'from-[#FF3155] via-red-600 to-[#FF00E5] shadow-[0_0_20px_rgba(255,49,85,0.3)]'
        : 'from-[#00E5FF] via-[#8B00FF] to-[#FF00E5] shadow-[0_0_20px_rgba(0,229,255,0.25)]'
    }`}>
      {/* Inner chamfered surface */}
      <div className="relative bg-[#080318]/90 backdrop-blur-md px-4 py-3 cyber-chamfer-md flex items-center justify-between gap-3">
        {/* Left: Shield Icon */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className={`w-11 h-11 flex-shrink-0 flex items-center justify-center cyber-chamfer-sm border transition-colors ${
              isConnected
                ? 'bg-[#00FF88]/15 border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.5)]'
                : isNoTraffic
                ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : isHandshake
                ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)]'
                : isError
                ? 'bg-[#FF3155]/15 border-[#FF3155] shadow-[0_0_15px_rgba(255,49,85,0.5)]'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            {isHandshake ? (
              <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
            ) : isConnected ? (
              <ShieldCheck className="w-6 h-6 text-[#00FF88] filter drop-shadow-[0_0_6px_#00FF88]" strokeWidth={2.4} />
            ) : isNoTraffic ? (
              <AlertTriangle className="w-6 h-6 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" strokeWidth={2.4} />
            ) : isError ? (
              <AlertTriangle className="w-6 h-6 text-[#FF3155]" strokeWidth={2.4} />
            ) : (
              <ShieldAlert className="w-6 h-6 text-slate-400" strokeWidth={2.4} />
            )}
          </div>

          {/* Texts matching state */}
          <div className="flex flex-col min-w-0">
            <h3 className="font-orbitron font-bold text-xs sm:text-sm tracking-wide text-white truncate">
              {getStatusTitle()}
            </h3>

            <p className="text-xs text-slate-300 font-rajdhani font-medium tracking-wide mt-0.5 truncate">
              {getStatusSubtitle()}
            </p>
          </div>
        </div>

        {/* Right: Quick Real Audit button */}
        {onOpenDiagnostics && (
          <button
            onClick={() => {
              cyberAudio.playClick();
              onOpenDiagnostics();
            }}
            title="Tester l'IP réelle et les fuites DNS"
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-[11px] font-mono-tech transition-all hover:scale-105 active:scale-95"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit Réseau</span>
          </button>
        )}
      </div>
    </div>
  );
};
