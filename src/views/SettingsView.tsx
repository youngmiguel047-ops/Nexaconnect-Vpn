/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Sliders, 
  Volume2, 
  ShieldCheck, 
  Lock, 
  FileCode, 
  Key, 
  Cpu, 
  Code2, 
  Info, 
  Smartphone,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { QuickSettings, TokenInfo, VpnProtocol } from '../types/vpn';
import { cyberAudio } from '../utils/audio';

interface SettingsViewProps {
  quickSettings: QuickSettings;
  onUpdateSetting: (key: keyof QuickSettings, val: boolean) => void;
  reducedEffects: boolean;
  onToggleReducedEffects: (val: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  selectedProtocol: VpnProtocol;
  onChangeProtocol: (protocol: VpnProtocol) => void;
  selectedDns: string;
  onChangeDns: (dns: string) => void;
  tokenInfo: TokenInfo | null;
  onOpenAtrs: () => void;
  onOpenToken: () => void;
  onOpenSplitTunneling: () => void;
  onOpenAndroidCenter: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  quickSettings,
  onUpdateSetting,
  reducedEffects,
  onToggleReducedEffects,
  soundEnabled,
  onToggleSound,
  selectedProtocol,
  onChangeProtocol,
  selectedDns,
  onChangeDns,
  tokenInfo,
  onOpenAtrs,
  onOpenToken,
  onOpenSplitTunneling,
  onOpenAndroidCenter,
}) => {
  const [showLegalModal, setShowLegalModal] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 no-scrollbar">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide text-glow-cyan">
            Paramètres Antares
          </h2>
          <p className="text-xs text-slate-400 font-rajdhani">
            Configuration du moteur et interface utilisateur
          </p>
        </div>
      </div>

      {/* 1. Apparence & Performance */}
      <div className="p-4 rounded-xl bg-[#080518] border border-slate-800 space-y-3 cyber-cut">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-orbitron font-bold text-xs text-white">
            Apparence & Performance Graphique
          </h3>
        </div>

        {/* Reduced visual effects toggle (Crucial for Section 14) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="font-orbitron text-xs text-white">
              Réduire les effets visuels
            </span>
            <span className="text-[11px] text-slate-400 font-rajdhani">
              Désactive la pluie Antares et les flous pour appareils modestes
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={reducedEffects}
            onClick={() => {
              cyberAudio.playToggle();
              onToggleReducedEffects(!reducedEffects);
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              reducedEffects ? 'bg-[#00E5FF]' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow-md transition-transform ${
                reducedEffects ? 'translate-x-4 bg-white shadow-[0_0_6px_#00E5FF]' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Audio feedback toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <div className="flex flex-col">
            <span className="font-orbitron text-xs text-white">
              Effets sonores synthétiques
            </span>
            <span className="text-[11px] text-slate-400 font-rajdhani">
              Chirps Web Audio et retours haptiques sonores
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => {
              cyberAudio.playToggle();
              onToggleSound();
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              soundEnabled ? 'bg-[#00FF88]' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black shadow-md transition-transform ${
                soundEnabled ? 'translate-x-4 bg-white shadow-[0_0_6px_#00FF88]' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Cyberpunk Theme Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono-tech">
          <span className="text-slate-400">Thème Actif :</span>
          <span className="text-[#00E5FF] font-bold">Neon Glitch Cyberpunk (Sombre)</span>
        </div>
      </div>

      {/* 2. Moteur VPN & Protocoles (sing-box) */}
      <div className="p-4 rounded-xl bg-[#09051C] border border-[#8B00FF]/35 space-y-3 cyber-cut">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#8B00FF]" />
          <h3 className="font-orbitron font-bold text-xs text-white">
            Moteur Réseau & Protocoles
          </h3>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono-tech text-slate-400">
            Protocole de transport chiffré :
          </span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {(['VLESS-Reality', 'Hysteria2', 'WireGuard', 'Shadowsocks'] as VpnProtocol[]).map((proto) => {
              const isSel = selectedProtocol === proto;
              return (
                <button
                  key={proto}
                  onClick={() => {
                    cyberAudio.playClick();
                    onChangeProtocol(proto);
                  }}
                  className={`p-2 rounded-lg border text-xs font-orbitron font-bold text-center transition-all ${
                    isSel
                      ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                      : 'border-slate-800 bg-black/40 text-slate-400 hover:text-white'
                  }`}
                >
                  {proto}
                </button>
              );
            })}
          </div>
        </div>

        {/* DNS Provider */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-mono-tech text-slate-400">
            Fournisseur DNS Sécurisé (DoH) :
          </span>
          <select
            value={selectedDns}
            onChange={(e) => {
              cyberAudio.playClick();
              onChangeDns(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-lg bg-black/70 border border-slate-700 text-xs font-mono-tech text-[#00FF88] focus:border-[#00E5FF] focus:outline-none"
          >
            <option value="1.1.1.1">Cloudflare DNS (1.1.1.1 DoH)</option>
            <option value="9.9.9.9">Quad9 Privacy & Malware Guard (9.9.9.9)</option>
            <option value="94.140.14.14">AdGuard AdBlock Strict DNS</option>
            <option value="8.8.8.8">Google DNS (8.8.8.8)</option>
          </select>
        </div>

        {/* Kill Switch Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <div className="flex flex-col">
            <span className="font-orbitron text-xs text-white">
              Kill Switch (Always-on)
            </span>
            <span className="text-[11px] text-slate-400 font-rajdhani">
              Bloque le trafic Internet si le tunnel VPN s'interrompt
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={true}
            onClick={() => cyberAudio.playToggle()}
            className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#00FF88]"
          >
            <span className="inline-block h-3.5 w-3.5 transform translate-x-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Split Tunneling trigger */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            onOpenSplitTunneling();
          }}
          className="w-full py-2 px-3 rounded-lg bg-white/5 border border-slate-800 hover:border-[#FF00E5] flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
        >
          <span>Gérer le Split Tunneling (Applications protégées)</span>
          <ChevronRight className="w-4 h-4 text-[#FF00E5]" />
        </button>
      </div>

      {/* 3. Configuration & Token Actions */}
      <div className="p-4 rounded-xl bg-[#080518] border border-slate-800 space-y-2.5">
        <span className="text-[10px] font-mono-tech uppercase text-slate-400">
          Licence & Profils
        </span>

        <button
          onClick={() => {
            cyberAudio.playClick();
            onOpenAtrs();
          }}
          className="w-full p-2.5 rounded-lg bg-[#0E0824] border border-[#00E5FF]/30 hover:border-[#00E5FF] flex items-center justify-between text-xs font-orbitron font-semibold text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#00E5FF]" />
            <span>Gestion des fichiers .atrs</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            cyberAudio.playClick();
            onOpenToken();
          }}
          className="w-full p-2.5 rounded-lg bg-[#0E0824] border border-[#8B00FF]/40 hover:border-[#8B00FF] flex items-center justify-between text-xs font-orbitron font-semibold text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#FF00E5]" />
            <span>Activer ou renouveler un token</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 4. Android Codebase & APK Builder Banner (Crucial for Requirement 19) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-[#8B00FF]/15 to-[#FF00E5]/10 border border-[#00E5FF]/50 cyber-cut space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-orbitron font-bold text-xs text-white">
              Code Source Android & Fichiers Gradle
            </h3>
          </div>
          <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88]">
            LIVRABLE PRÊT
          </span>
        </div>

        <p className="text-xs text-slate-300 font-rajdhani">
          Consultez, copiez et téléchargez le projet Android complet (Kotlin, Jetpack Compose, VpnService, Gradle, Manifeste, tests et instructions APK).
        </p>

        <button
          onClick={() => {
            cyberAudio.playClick();
            onOpenAndroidCenter();
          }}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#8B00FF] text-white font-orbitron font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95"
        >
          Ouvrir le Centre de Code Android & Instructions APK
        </button>
      </div>

      {/* 5. App Information & Legal */}
      <div className="p-4 rounded-xl bg-[#060310] border border-slate-800 space-y-2 text-xs font-mono-tech text-slate-400">
        <div className="flex items-center justify-between">
          <span>Application :</span>
          <span className="text-white">Antares VPN Android</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Package ID :</span>
          <span className="text-[#00E5FF]">com.antares.vpn</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Version :</span>
          <span className="text-white">3.4.0-neon (Build 2026.11)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Architecture cible :</span>
          <span className="text-white">arm64-v8a / armeabi-v7a / x86_64</span>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setShowLegalModal(true)}
            className="text-[11px] text-[#00E5FF] hover:underline"
          >
            Politique de Confidentialité & Conditions
          </button>
          <span className="text-[10px] text-slate-600">Zero-Logs Policy</span>
        </div>
      </div>

      {/* Legal Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-4 rounded-2xl bg-[#090518] border border-[#00E5FF]/40 space-y-3">
            <h3 className="font-orbitron font-bold text-sm text-white">
              Politique de Confidentialité Antares VPN
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
              Antares VPN applique une politique stricte de non-conservation des journaux d'activité (« Strict Zero-Log »). Aucune adresse IP d'origine, requête DNS, historique de navigation ou métadonnée de session n'est enregistrée sur les serveurs ou transmise à des tiers.
            </p>
            <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
              Le tunnel utilise des protocoles chiffrés modernes (VLESS-Reality et Hysteria 2) avec secret de transmission parfait (Perfect Forward Secrecy).
            </p>
            <button
              onClick={() => setShowLegalModal(false)}
              className="w-full py-2 rounded-lg bg-slate-800 text-white font-orbitron font-semibold text-xs"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
