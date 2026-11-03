/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Bell, Volume2, VolumeX, Smartphone, Monitor, Plus } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface TopBarProps {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenManualVless: () => void;
  onOpenAtrsManager?: () => void;
  unreadNotificationsCount?: number;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onOpenManualVless,
  onOpenAtrsManager,
  unreadNotificationsCount = 2,
  isPhoneFrame,
  onToggleFrame,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="relative z-20 flex items-center justify-between px-3 py-2.5 bg-transparent select-none">
      {/* Left: Hexagonal Chamfered Hamburger Button (Exact replica from Screenshot 1) */}
      <button
        onClick={() => {
          cyberAudio.playClick();
          onOpenDrawer();
        }}
        aria-label="Ouvrir le menu principal"
        className="relative w-10 h-10 flex items-center justify-center bg-[#070314]/90 hover:bg-[#00E5FF]/15 active:scale-95 transition-all text-[#00E5FF] border border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.35)] cyber-chamfer-sm cursor-pointer"
      >
        <Menu className="w-5 h-5 text-white" strokeWidth={2.4} />
      </button>

      {/* Center: Exact ANTARES VPN Logo Lockup (Exact replica from Screenshot 1) */}
      <div 
        className="flex flex-col items-center justify-center cursor-pointer group select-none"
        onClick={() => cyberAudio.playClick()}
      >
        <div className="relative flex flex-col items-center">
          {/* Golden Crown on top of 'A' */}
          <div className="relative -mb-1 z-10">
            <svg 
              viewBox="0 0 24 16" 
              className="w-5 h-3.5 text-[#FFE600] filter drop-shadow-[0_0_6px_#FFE600]"
              fill="currentColor"
            >
              <path d="M2 14 L0 2 L6 7 L12 0 L18 7 L24 2 L22 14 Z" />
              <circle cx="12" cy="1" r="1.5" fill="#FFFFFF" />
              <circle cx="0" cy="2" r="1.2" fill="#FFFFFF" />
              <circle cx="24" cy="2" r="1.2" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Stylized Wordmark: ANTARES with slicing cyan orbital ring */}
          <div className="relative flex items-center justify-center">
            {/* Glowing cyan orbital ring */}
            <div 
              className="absolute -inset-x-3 -top-1 bottom-1 pointer-events-none rounded-[100%] border-t-2 border-r border-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
              style={{
                transform: 'rotate(-18deg) scaleY(0.45)',
              }}
            />

            <span className="font-orbitron font-black text-lg sm:text-xl tracking-wider text-white text-glow-cyan">
              ANTARES
            </span>
          </div>

          {/* Underneath: VPN in vibrant purple/magenta neon */}
          <div className="flex items-center gap-1.5 -mt-0.5">
            <div className="w-2 h-0.5 bg-[#FF00E5] shadow-[0_0_4px_#FF00E5]" />
            <span className="font-orbitron font-black text-xs sm:text-sm tracking-widest text-[#FF00E5] text-glow-magenta">
              VPN
            </span>
            <div className="w-2 h-0.5 bg-[#FF00E5] shadow-[0_0_4px_#FF00E5]" />
          </div>
        </div>
      </div>

      {/* Right Controls: Manual VLESS Quick Button, Sound, Frame, & Hexagonal Bell */}
      <div className="flex items-center gap-1.5">
        {/* Quick Add VLESS .atrs button */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            if (onOpenAtrsManager) {
              onOpenAtrsManager();
            } else {
              onOpenManualVless();
            }
          }}
          title="Mes configurations ATRS (.atrs)"
          className="p-1.5 rounded-lg border border-[#00E5FF]/40 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] active:scale-95 transition-all flex items-center gap-1 text-[10px] font-orbitron font-bold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span className="hidden sm:inline">.ATRS</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            cyberAudio.playClick();
          }}
          title={soundEnabled ? 'Effets sonores activés' : 'Effets sonores coupés'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00E5FF] transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00FF88]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Frame toggle */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            onToggleFrame();
          }}
          title={isPhoneFrame ? 'Basculer en plein écran' : 'Basculer en cadre smartphone Android'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00E5FF] transition-colors hidden sm:flex"
        >
          {isPhoneFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-[#00E5FF]" />}
        </button>

        {/* Hexagonal Notification Bell (Exact replica from Screenshot 1) */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            onOpenNotifications();
          }}
          aria-label="Notifications"
          className="relative w-10 h-10 flex items-center justify-center bg-[#070314]/90 hover:bg-[#FF00E5]/15 active:scale-95 transition-all text-[#FF00E5] border border-[#FF00E5]/60 shadow-[0_0_12px_rgba(255,0,229,0.35)] cyber-chamfer-sm cursor-pointer"
        >
          <Bell className="w-5 h-5 text-white" strokeWidth={2.4} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3155] shadow-[0_0_8px_#FF3155] animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};
