/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  FileCode, 
  Key, 
  Smartphone, 
  Code2, 
  Globe, 
  Activity, 
  Settings, 
  Plus
} from 'lucide-react';
import { TokenInfo } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tokenInfo: TokenInfo | null;
  onNavigateTab: (tab: 'home' | 'stats' | 'servers' | 'settings') => void;
  onOpenAtrs: () => void;
  onOpenManualVless: () => void;
  onOpenToken: () => void;
  onOpenPremium: () => void;
  onOpenAndroidCenter: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  tokenInfo,
  onNavigateTab,
  onOpenAtrs,
  onOpenManualVless,
  onOpenToken,
  onOpenPremium,
  onOpenAndroidCenter,
}) => {
  if (!isOpen) return null;

  const isVip = tokenInfo && tokenInfo.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-4/5 max-w-xs h-full bg-[#080516] border-r border-[#00E5FF]/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-250">
        <div>
          {/* Header Profile / Branding with Official App Emblem (Image 2) */}
          <div className="p-4 border-b border-slate-800 bg-[#0C0722] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Official App Emblem */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#8B00FF] p-0.5 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <img
                  src="/assets/aistudio/file_000000008dc081f49538a3e50a44fe57_84cf991d.png"
                  alt="Antares VPN Official Emblem"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-orbitron font-extrabold text-sm text-white tracking-wider">
                  ANTARES VPN
                </span>
                <span className="text-[10px] font-mono-tech text-[#00FF88] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                  Moteur sing-box v1.10+
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Membership Card */}
          <div className="p-3 mx-3 my-3 rounded-xl bg-gradient-to-r from-[#120828] to-[#0A0518] border border-[#8B00FF]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-orbitron font-bold text-xs text-white">
                  {isVip ? `Plan ${tokenInfo.tier}` : 'Plan Gratuit'}
                </span>
                <p className="text-[10px] font-mono-tech text-slate-400">
                  {isVip
                    ? `Jusqu'au ${new Date(tokenInfo.expiresAt).toLocaleDateString('fr-FR')}`
                    : 'Vitesse standard limitée'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenPremium();
              }}
              className="px-2 py-1 rounded bg-[#FF00E5]/20 hover:bg-[#FF00E5]/30 border border-[#FF00E5]/40 text-[#FF00E5] font-orbitron font-bold text-[10px]"
            >
              {isVip ? 'Détails' : 'Upgrade'}
            </button>
          </div>

          {/* Menu Sections */}
          <div className="px-3 py-2 space-y-1 text-xs font-orbitron font-semibold">
            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigateTab('home');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-[#00E5FF]" />
              <span>Accueil VPN</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigateTab('servers');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <Globe className="w-4 h-4 text-[#00FF88]" />
              <span>Nœuds & Serveurs</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigateTab('stats');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <Activity className="w-4 h-4 text-[#FF00E5]" />
              <span>Télémétrie Graph</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onNavigateTab('settings');
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-[#8B00FF]" />
              <span>Paramètres Système</span>
            </button>

            <div className="pt-2 my-2 border-t border-slate-800">
              <span className="px-3 text-[10px] font-mono-tech uppercase tracking-wider text-slate-500">
                Configuration VLESS & .ATRS
              </span>
            </div>

            {/* Manual VLESS configuration button */}
            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenManualVless();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] hover:bg-[#00FF88]/25 transition-colors shadow-[0_0_12px_rgba(0,255,136,0.2)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter VLESS Manuel (.atrs)</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenAtrs();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <FileCode className="w-4 h-4 text-[#00E5FF]" />
              <span>Profil .ATRS Import / Export</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenAndroidCenter();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/25 transition-colors shadow-[0_0_12px_rgba(0,229,255,0.2)]"
            >
              <Code2 className="w-4 h-4 text-[#00E5FF]" />
              <span>Projet Android & Code APK</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenToken();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#00E5FF]/10 transition-colors"
            >
              <Key className="w-4 h-4 text-[#8B00FF]" />
              <span>Activer un Token VIP</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060310] space-y-1">
          <div className="text-[10px] font-mono-tech text-slate-400">
            Package : com.antares.vpn
          </div>
          <div className="text-[10px] font-mono-tech text-slate-500 flex items-center justify-between">
            <span>Version 3.4.0-neon</span>
            <span className="text-[#00E5FF]">Build 2026.11</span>
          </div>
        </div>
      </div>

      {/* Backdrop Click Dismiss */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
