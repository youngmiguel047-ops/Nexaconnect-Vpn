/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProtectionCard } from '../components/ProtectionCard';
import { VpnPowerButton } from '../components/VpnPowerButton';
import { ServerSelector } from '../components/ServerSelector';
import { VpnStatsCard } from '../components/VpnStatsCard';
import { QuickOptions } from '../components/QuickOptions';
import { PremiumBanner } from '../components/PremiumBanner';
import { Plus, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { 
  VpnConnectionState, 
  VpnServer, 
  VpnStats, 
  QuickSettings, 
  TokenInfo 
} from '../types/vpn';
import { cyberAudio } from '../utils/audio';
import { NeonTheme } from '../utils/theme';

interface HomeViewProps {
  connectionState: VpnConnectionState;
  onToggleConnect: () => void;
  activeServer: VpnServer;
  onOpenServerModal: () => void;
  onOpenManualVless: () => void;
  onOpenDiagnostics: () => void;
  stats: VpnStats;
  quickSettings: QuickSettings;
  onUpdateSetting: (key: keyof QuickSettings, val: boolean) => void;
  onOpenSplitTunneling: () => void;
  onOpenPremium: () => void;
  tokenInfo: TokenInfo | null;
  realIp?: string;
  isNativeAndroid?: boolean;
  theme?: NeonTheme;
}

export const HomeView: React.FC<HomeViewProps> = ({
  connectionState,
  onToggleConnect,
  activeServer,
  onOpenServerModal,
  onOpenManualVless,
  onOpenDiagnostics,
  stats,
  quickSettings,
  onUpdateSetting,
  onOpenSplitTunneling,
  onOpenPremium,
  tokenInfo,
  realIp = '82.64.120.45',
  isNativeAndroid = false,
  theme,
}) => {
  const isVip = Boolean(tokenInfo && tokenInfo.status === 'active');

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 pb-24 no-scrollbar select-none">
      {/* 1. Protection HUD Card matching Screenshot */}
      <ProtectionCard
        state={connectionState}
        activeServer={activeServer}
        realIp={realIp}
        protectedIp={activeServer.ip}
        onOpenDiagnostics={onOpenDiagnostics}
      />

      {/* 2. Spectacular Central VPN Power Button matching Screenshot */}
      <VpnPowerButton
        state={connectionState}
        onToggleConnect={onToggleConnect}
        theme={theme}
      />

      {/* 3. Server Selector Card matching Screenshot */}
      <div className="space-y-1.5">
        <ServerSelector
          server={activeServer}
          onClick={onOpenServerModal}
        />

        {/* Quick VLESS Manual Config shortcut bar */}
        <div className="flex items-center justify-between px-2 text-[11px] font-mono-tech">
          <button
            onClick={() => {
              cyberAudio.playClick();
              onOpenManualVless();
            }}
            className="text-[#00E5FF] hover:text-white flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00E5FF] group-hover:rotate-90 transition-transform" />
            <span className="underline decoration-[#00E5FF]/40 underline-offset-2">
              Ajouter VLESS manuellement (.atrs)
            </span>
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onOpenDiagnostics();
            }}
            className="text-slate-400 hover:text-[#00FF88] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Activity className="w-3 h-3 text-[#00FF88]" />
            <span>Audit Réel & Fuites</span>
          </button>
        </div>
      </div>

      {/* 4. VPN Statistics Card (3 columns: Téléchargement, Envoi, Durée) */}
      <VpnStatsCard
        stats={stats}
        connectionState={connectionState}
        isSimulated={!isNativeAndroid}
      />

      {/* 5. 4 Quick Options (2x2 Grid) */}
      <QuickOptions
        settings={quickSettings}
        onUpdateSetting={onUpdateSetting}
        onOpenSplitTunneling={onOpenSplitTunneling}
      />

      {/* 6. Antares VPN Premium Banner matching Screenshot */}
      <PremiumBanner
        onOpenPremium={onOpenPremium}
        isVip={isVip}
      />
    </div>
  );
};
