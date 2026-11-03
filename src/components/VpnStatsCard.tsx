/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { VpnStats, VpnConnectionState } from '../types/vpn';

interface VpnStatsCardProps {
  stats: VpnStats;
  connectionState: VpnConnectionState;
  isSimulated?: boolean;
}

export const VpnStatsCard: React.FC<VpnStatsCardProps> = ({
  stats,
  connectionState,
}) => {
  const isConnected = connectionState === 'connected';
  const isNoTraffic = connectionState === 'no_traffic';
  const hasActiveSession = isConnected || isNoTraffic;

  const formatDuration = (seconds: number) => {
    if (!hasActiveSession || seconds <= 0) return '--:--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSpeed = (kbps: number) => {
    if (isNoTraffic) return '0.0 KB/s';
    if (!isConnected) return 'Indisponible';
    if (kbps <= 0) return '0.0 KB/s';
    if (kbps > 1024) {
      return `${(kbps / 1024).toFixed(1)} MB/s`;
    }
    return `${kbps.toFixed(1)} KB/s`;
  };

  return (
    <div className={`relative mx-1 p-[1px] bg-gradient-to-r cyber-chamfer-md select-none transition-all ${
      isNoTraffic 
        ? 'from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_18px_rgba(251,191,36,0.25)]'
        : 'from-[#00E5FF] via-[#8B00FF] to-[#FF00E5] shadow-[0_0_18px_rgba(139,0,255,0.25)]'
    }`}>
      <div className="relative bg-[#070314]/90 backdrop-blur-md px-3 py-3.5 cyber-chamfer-md grid grid-cols-3 divide-x divide-slate-800/80 text-center">
        {/* Col 1: Téléchargement */}
        <div className="flex flex-col items-center justify-center px-1">
          <ArrowDown className={`w-4 h-4 mb-1 ${isNoTraffic ? 'text-amber-400' : 'text-[#00E5FF]'}`} strokeWidth={2.5} />
          <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-full">
            {hasActiveSession ? `↓ ${formatSpeed(stats.downSpeed)}` : 'Indisponible'}
          </span>
          <span className="text-[11px] font-rajdhani font-semibold text-slate-400 mt-0.5">
            {isNoTraffic ? '0 paquet reçu' : 'Téléchargement'}
          </span>
        </div>

        {/* Col 2: Envoi */}
        <div className="flex flex-col items-center justify-center px-1">
          <ArrowUp className="w-4 h-4 text-[#FF00E5] mb-1" strokeWidth={2.5} />
          <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-full">
            {hasActiveSession ? `↑ ${formatSpeed(stats.upSpeed)}` : 'Indisponible'}
          </span>
          <span className="text-[11px] font-rajdhani font-semibold text-slate-400 mt-0.5">
            {stats.packetsOut ? `${stats.packetsOut} paquets émis` : 'Envoi'}
          </span>
        </div>

        {/* Col 3: Durée */}
        <div className="flex flex-col items-center justify-center px-1">
          <Clock className="w-4 h-4 text-[#00E5FF] mb-1" strokeWidth={2.5} />
          <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-tight">
            {formatDuration(stats.durationSeconds)}
          </span>
          <span className="text-[11px] font-rajdhani font-semibold text-slate-400 mt-0.5">
            {isNoTraffic ? 'Inactif' : 'Durée'}
          </span>
        </div>
      </div>
    </div>
  );
};
