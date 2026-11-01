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
import { Plus, FileCode } from 'lucide-react';
import { 
  VpnConnectionState, 
  VpnServer, 
  VpnStats, 
  QuickSettings, 
  TokenInfo 
} from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface HomeViewProps {
  connectionState: VpnConnectionState;
  onToggleConnect: () => void;
  activeServer: VpnServer;
  onOpenServerModal: () => void;
  onOpenManualVless: () => void;
  stats: VpnStats;
  quickSettings: QuickSettings;
  onUpdateSetting: (key: keyof QuickSettings, val: boolean) => void;
  onOpenSplitTunneling: () => void;
  onOpenPremium: () => void;
  tokenInfo: TokenInfo | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  connectionState,
  onToggleConnect,
  activeServer,
  onOpenServerModal,
  onOpenManualVless,
  stats,
  quickSettings,
  onUpdateSetting,
  onOpenSplitTunneling,
  onOpenPremium,
  tokenInfo,
}) => {
  const isVip = Boolean(tokenInfo && tokenInfo.status === 'active');

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 pb-24 no-scrollbar select-none">
      {/* 1. Protection HUD Card matching Screenshot */}
      <ProtectionCard
        state={connectionState}
        activeServer={activeServer}
        realIp="185.190.142.66"
        protectedIp={activeServer.ip}
      />

      {/* 2. Spectacular Central VPN Power Button matching Screenshot */}
      <VpnPowerButton
        state={connectionState}
        onToggleConnect={onToggleConnect}
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

          <span className="text-slate-500 text-[10px]">
            {activeServer.protocol} • {activeServer.ping}ms
          </span>
        </div>
      </div>

      {/* 4. VPN Statistics Card (3 columns: Téléchargement, Envoi, Durée) */}
      <VpnStatsCard
        stats={stats}
        connectionState={connectionState}
        isSimulated={true}
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
