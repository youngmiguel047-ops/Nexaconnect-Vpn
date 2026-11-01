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
  const isConnecting = state === 'connecting';
  const isError = state === 'error';

  return (
    <div className="relative mx-1 p-[1px] bg-gradient-to-r from-[#00E5FF] via-[#8B00FF] to-[#FF00E5] cyber-chamfer-md shadow-[0_0_20px_rgba(0,229,255,0.25)] select-none">
      {/* Inner chamfered surface */}
      <div className="relative bg-[#080318]/90 backdrop-blur-md px-4 py-3 cyber-chamfer-md flex items-center justify-between gap-3">
        {/* Left: Shield Icon with green glow */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className={`w-11 h-11 flex-shrink-0 flex items-center justify-center cyber-chamfer-sm border transition-colors ${
              isConnected
                ? 'bg-[#00FF88]/15 border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.5)]'
                : isConnecting
                ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.5)]'
                : isError
                ? 'bg-[#FF3155]/15 border-[#FF3155] shadow-[0_0_15px_rgba(255,49,85,0.5)]'
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 text-[#00E5FF] animate-spin" />
            ) : isConnected ? (
              <ShieldCheck className="w-6 h-6 text-[#00FF88] filter drop-shadow-[0_0_6px_#00FF88]" strokeWidth={2.4} />
            ) : isError ? (
              <AlertTriangle className="w-6 h-6 text-[#FF3155]" strokeWidth={2.4} />
            ) : (
              <ShieldAlert className="w-6 h-6 text-slate-400" strokeWidth={2.4} />
            )}
          </div>

          {/* Texts exactly matching screenshot */}
          <div className="flex flex-col min-w-0">
            <h3 className="font-orbitron font-bold text-xs sm:text-sm tracking-wide text-white truncate">
              {isConnected ? (
                <span>
                  Votre connexion est <span className="text-[#00FF88] text-glow-green">protégée</span>
                </span>
              ) : isConnecting ? (
                <span>
                  Connexion <span className="text-[#00E5FF] text-glow-cyan">en cours...</span>
                </span>
              ) : isError ? (
                <span>
                  Connexion <span className="text-[#FF3155] text-glow-red">échouée</span>
                </span>
              ) : (
                <span>
                  Connexion <span className="text-slate-400">non protégée</span>
                </span>
              )}
            </h3>

            <p className="text-xs text-slate-300 font-rajdhani font-medium tracking-wide mt-0.5 truncate">
              {isConnected
                ? `Tunnel actif • IP: ${protectedIp || activeServer.ip}`
                : isConnecting
                ? `Échange de clés avec ${activeServer.name}`
                : isError
                ? 'Serveur inaccessible ou clé invalide'
                : `IP réelle visible: ${realIp}`}
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
