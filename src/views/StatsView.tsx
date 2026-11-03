/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Server, 
  Radio, 
  Wifi,
  Zap
} from 'lucide-react';
import { VpnStats, VpnConnectionState, VpnServer } from '../types/vpn';

interface StatsViewProps {
  stats: VpnStats;
  connectionState: VpnConnectionState;
  activeServer: VpnServer;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  connectionState,
  activeServer,
}) => {
  const isConnected = connectionState === 'connected';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 no-scrollbar">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide text-glow-cyan">
            Télémétrie & Flux Réseau
          </h2>
          <p className="text-xs text-slate-400 font-rajdhani">
            Mesures en temps réel du tunnel cryptographique
          </p>
        </div>

        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
          {isConnected ? 'CONNEXION ACTIVE' : 'VEILLE RÉSEAU'}
        </span>
      </div>

      {/* Main Speed Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[#080518]/90 border border-[#00FF88]/30 cyber-cut flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-tech text-slate-400">Débit Descendant</span>
            <ArrowDown className="w-4 h-4 text-[#00FF88]" />
          </div>
          <span className="font-orbitron font-extrabold text-xl text-white text-glow-green">
            {isConnected ? (stats.downSpeed > 0 ? `${(stats.downSpeed / 1024).toFixed(2)} MB/s` : '0.00 MB/s') : 'Indisponible'}
          </span>
          <div className="mt-2 text-[10px] font-mono-tech text-slate-400">
            Total transféré : {isConnected ? `${(stats.totalDown / 1024).toFixed(2)} GB` : '--'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#080518]/90 border border-[#00E5FF]/30 cyber-cut flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-tech text-slate-400">Débit Ascendant</span>
            <ArrowUp className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <span className="font-orbitron font-extrabold text-xl text-white text-glow-cyan">
            {isConnected ? (stats.upSpeed > 0 ? `${(stats.upSpeed / 1024).toFixed(2)} MB/s` : '0.00 MB/s') : 'Indisponible'}
          </span>
          <div className="mt-2 text-[10px] font-mono-tech text-slate-400">
            Total envoyé : {isConnected ? `${(stats.totalUp / 1024).toFixed(2)} GB` : '--'}
          </div>
        </div>
      </div>

      {/* Cryptographic Engine Security Audit */}
      <div className="p-4 rounded-xl bg-[#0B0620] border border-[#8B00FF]/40 space-y-3 cyber-cut">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#8B00FF]" />
            <span className="font-orbitron font-bold text-xs text-white">
              Spécifications du Chiffrement
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-[#00FF88]">Vérifié</span>
        </div>

        <div className="space-y-2 text-xs font-mono-tech divide-y divide-slate-800">
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Algorithme de Chiffrement :</span>
            <span className="text-white font-semibold">{stats.cipher}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Protocole Actif :</span>
            <span className="text-[#00E5FF] font-semibold">{activeServer.protocol}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Échange de Clés :</span>
            <span className="text-white">X25519 / Curve25519 PFS</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Contournement DPI :</span>
            <span className="text-[#00FF88]">Actif (Anti-Censure)</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Moteur Sous-jacent :</span>
            <span className="text-[#FF00E5]">sing-box core (libbox Go)</span>
          </div>
        </div>
      </div>

      {/* Latency & Network Quality */}
      <div className="p-4 rounded-xl bg-[#080516] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-orbitron font-bold text-xs text-white">
              Qualité du Nœud ({activeServer.name})
            </span>
          </div>
          <span className="text-xs font-mono-tech font-bold text-[#00FF88]">
            {activeServer.ping} ms
          </span>
        </div>

        {/* Latency bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-400 mb-1">
            <span>Stabilité du lien</span>
            <span>Perte de paquets : {stats.packetLoss}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00FF88] to-[#00E5FF]"
              style={{ width: `${Math.max(10, 100 - activeServer.load)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono-tech text-slate-300">
          <div className="p-2 rounded bg-black/50 border border-slate-800">
            <span className="text-slate-500 block text-[9px]">PAQUETS IP TUN (ÉMIS / REÇUS)</span>
            <span className="text-white font-bold">{stats.packetsOut || 0} / {stats.packetsReturned || 0}</span>
          </div>
          <div className="p-2 rounded bg-black/50 border border-slate-800">
            <span className="text-slate-500 block text-[9px]">SERVEUR SORTIE</span>
            <span className="text-white">{activeServer.ip}:{activeServer.port}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
