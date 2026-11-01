/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Network, Search, Check, Shield, Plus, RefreshCw, Smartphone } from 'lucide-react';
import { AppProfile } from '../types/vpn';
import { realVpn } from '../services/realVpnEngine';
import { cyberAudio } from '../utils/audio';

interface SplitTunnelingModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppProfile[];
  onToggleAppBypass: (packageName: string) => void;
  onAddCustomApp?: (app: AppProfile) => void;
}

export const SplitTunnelingModal: React.FC<SplitTunnelingModalProps> = ({
  isOpen,
  onClose,
  apps,
  onToggleAppBypass,
  onAddCustomApp,
}) => {
  const [search, setSearch] = useState('');
  const [customPackage, setCustomPackage] = useState('');
  const [loadingNative, setLoadingNative] = useState(false);
  const isNative = realVpn.isNativeEnvironment();

  if (!isOpen) return null;

  const handleScanNativeApps = async () => {
    setLoadingNative(true);
    cyberAudio.playClick();
    try {
      const nativeApps = await realVpn.getRealInstalledApps();
      if (nativeApps.length > 0 && onAddCustomApp) {
        nativeApps.forEach((na) => {
          if (!apps.some((a) => a.packageName === na.packageName)) {
            onAddCustomApp(na);
          }
        });
      }
    } finally {
      setLoadingNative(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPackage.trim() || !onAddCustomApp) return;

    const trimmed = customPackage.trim().toLowerCase();
    const newApp: AppProfile = {
      packageName: trimmed,
      appName: trimmed.split('.').pop() || trimmed,
      iconType: '📦',
      isBypassed: true,
    };
    onAddCustomApp(newApp);
    setCustomPackage('');
    cyberAudio.playToggle();
  };

  const filtered = apps.filter(
    (a) =>
      a.appName.toLowerCase().includes(search.toLowerCase()) ||
      a.packageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#080516] border border-[#FF00E5]/40 shadow-[0_0_50px_rgba(255,0,229,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0C0620]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FF00E5]/15 text-[#FF00E5]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                Split Tunneling Réel (Android)
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Routage par application via Builder.addDisallowedApplication
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native scanner & search */}
        <div className="p-3 bg-[#080518] border-b border-slate-800 space-y-2">
          {isNative && (
            <button
              onClick={handleScanNativeApps}
              disabled={loadingNative}
              className="w-full py-1.5 px-3 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono-tech flex items-center justify-center gap-2 hover:bg-[#00E5FF]/25 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNative ? 'animate-spin' : ''}`} />
              {loadingNative ? 'Chargement des paquets système...' : 'Scanner les applications réelles du téléphone'}
            </button>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filtrer les applications par nom ou package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-700 focus:border-[#FF00E5] focus:outline-none text-xs text-white font-rajdhani"
            />
          </div>

          {/* Add custom package */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              placeholder="Ajouter un package (ex: com.bank.app)..."
              value={customPackage}
              onChange={(e) => setCustomPackage(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 focus:border-[#00E5FF] focus:outline-none text-xs text-white font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#FF00E5]/20 hover:bg-[#FF00E5]/30 text-[#FF00E5] border border-[#FF00E5]/40 text-xs font-mono-tech flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </form>
        </div>

        {/* App List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[380px] no-scrollbar">
          {filtered.map((app) => {
            const isProtected = !app.isBypassed;
            return (
              <div
                key={app.packageName}
                onClick={() => {
                  cyberAudio.playToggle();
                  onToggleAppBypass(app.packageName);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isProtected
                    ? 'border-[#00E5FF]/40 bg-[#00E5FF]/5'
                    : 'border-slate-800 bg-black/40 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {app.iconType}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-orbitron font-bold text-xs text-white truncate">
                      {app.appName}
                    </span>
                    <span className="text-[10px] font-mono-tech text-slate-500 truncate">
                      {app.packageName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-mono-tech px-2 py-0.5 rounded ${
                      isProtected
                        ? 'bg-[#00FF88]/15 text-[#00FF88]'
                        : 'bg-amber-400/15 text-amber-400'
                    }`}
                  >
                    {isProtected ? 'VPN Chiffré' : 'Bypass Direct'}
                  </span>

                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                      isProtected
                        ? 'bg-[#00E5FF] border-[#00E5FF] text-black'
                        : 'border-slate-700 bg-transparent'
                    }`}
                  >
                    {isProtected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060310] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[#00FF88]">
            <Shield className="w-3.5 h-3.5" />
            <span>{apps.filter((a) => !a.isBypassed).length} apps protégées • {apps.filter((a) => a.isBypassed).length} bypass</span>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-bold text-xs"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
