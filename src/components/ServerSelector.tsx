/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { VpnServer } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface ServerSelectorProps {
  server: VpnServer;
  onClick: () => void;
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({ server, onClick }) => {
  return (
    <div
      onClick={() => {
        cyberAudio.playClick();
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className="relative mx-1 p-[1px] bg-gradient-to-r from-[#00E5FF] via-[#0066FF] to-[#8B00FF] cyber-chamfer-md shadow-[0_0_18px_rgba(0,102,255,0.25)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer group select-none"
    >
      <div className="relative bg-[#070314]/90 backdrop-blur-md px-4 py-3 cyber-chamfer-md flex items-center justify-between gap-3">
        {/* Left: Blue circular globe icon badge */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_#0066FF] group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-rajdhani font-semibold text-slate-400 tracking-wider">
              Serveur
            </span>
            <span className="font-orbitron font-bold text-xs sm:text-sm text-white tracking-wide truncate group-hover:text-[#00E5FF] transition-colors">
              {server.name}
            </span>
          </div>
        </div>

        {/* Right: Down Chevron */}
        <div className="text-white group-hover:text-[#00E5FF] transition-colors pr-1">
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
