/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Key, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Radio, 
  Info,
  Loader2
} from 'lucide-react';
import { TokenInfo } from '../types/vpn';
import { TokenValidator } from '../utils/tokenValidator';
import { cyberAudio } from '../utils/audio';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenInfo: TokenInfo | null;
  onTokenActivated: (info: TokenInfo) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  tokenInfo,
  onTokenActivated,
}) => {
  const [inputToken, setInputToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleValidate = async (tokenToTest?: string) => {
    const val = (tokenToTest || inputToken).trim();
    if (!val) {
      setValidationMsg({ text: 'Veuillez saisir une clé ou un token.', isError: true });
      cyberAudio.playGlitch();
      return;
    }

    setIsValidating(true);
    setValidationMsg(null);
    cyberAudio.playClick();

    const res = await TokenValidator.validateToken(val);
    setIsValidating(false);

    if (res.valid && res.tokenInfo) {
      cyberAudio.playConnect();
      setValidationMsg({ text: res.message, isError: false });
      onTokenActivated(res.tokenInfo);
    } else {
      cyberAudio.playGlitch();
      setValidationMsg({ text: res.message, isError: true });
    }
  };

  const vipFeatures = [
    { title: 'Serveurs 10 Gbps Ultra Low Ping', desc: 'Accès exclusif aux nœuds VIP Tokyo, Zurich, Los Angeles', icon: Zap },
    { title: 'Protocole Hysteria 2 UDP Turbo', desc: 'Contournement DPI avancé et accélération BBR', icon: Cpu },
    { title: 'Protection DNS DoH Strict', desc: 'Zéro fuite DNS, blocage pub et trackers malveillants', icon: ShieldCheck },
    { title: 'Jusqu’à 10 Appareils Simultanés', desc: 'Protégez smartphones, tablettes et télévisions', icon: Radio },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#090518] border border-[#FF00E5]/40 shadow-[0_0_60px_rgba(255,0,229,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0E0724]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
              <Crown className="w-5 h-5 fill-amber-400/30" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                Antares VPN Premium VIP
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Architecture réseau cryptographique débloquée
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

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Subscription Status Card */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono-tech uppercase text-slate-400">
                Statut de l'abonnement
              </span>
              <span className="font-orbitron font-bold text-sm text-white">
                {tokenInfo && tokenInfo.status === 'active' ? (
                  <span className="text-[#00FF88] flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Membre {tokenInfo.tier}
                  </span>
                ) : (
                  <span className="text-slate-400">Plan Gratuit Standard</span>
                )}
              </span>
            </div>

            {tokenInfo && tokenInfo.status === 'active' ? (
              <div className="text-right">
                <span className="text-[10px] font-mono-tech text-slate-400">Expire le</span>
                <p className="text-xs font-mono-tech text-[#00E5FF]">
                  {new Date(tokenInfo.expiresAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ) : (
              <span className="text-xs font-mono-tech px-2 py-1 rounded bg-[#FF00E5]/15 text-[#FF00E5] border border-[#FF00E5]/30">
                Activation requise
              </span>
            )}
          </div>

          {/* VIP Features List */}
          <div className="space-y-2">
            <h4 className="text-xs font-orbitron font-semibold text-slate-300 uppercase tracking-wider">
              Fonctionnalités Incluses
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vipFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0E0824]/60 border border-slate-800 flex items-start gap-2.5"
                  >
                    <Icon className="w-4 h-4 text-[#FF00E5] flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-orbitron font-bold text-xs text-white leading-tight">
                        {f.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 font-rajdhani mt-0.5">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Token Activation Input */}
          <div className="p-4 rounded-xl bg-[#0B061E] border border-[#8B00FF]/40 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#00E5FF]" />
              <h4 className="font-orbitron font-bold text-xs text-white">
                Activation par Token Cryptographique
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-rajdhani">
              Entrez votre jeton de licence Antares ou utilisez un token de démonstration pour activer l'accès VIP immédiat :
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ATRS-XXXX-XXXX-XXX"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-lg bg-black/70 border border-slate-700 focus:border-[#00E5FF] focus:outline-none text-xs text-white font-mono-tech tracking-wider uppercase"
              />
              <button
                onClick={() => handleValidate()}
                disabled={isValidating}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#8B00FF] hover:brightness-110 active:scale-95 text-white font-orbitron font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)] disabled:opacity-50"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Activer</span>
                )}
              </button>
            </div>

            {/* Validation Message */}
            {validationMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-mono-tech ${
                  validationMsg.isError
                    ? 'bg-[#FF3155]/15 border border-[#FF3155]/30 text-[#FF3155]'
                    : 'bg-[#00FF88]/15 border border-[#00FF88]/30 text-[#00FF88]'
                }`}
              >
                {validationMsg.text}
              </div>
            )}

            {/* Quick Demo Tokens */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono-tech text-slate-400 block mb-1.5">
                Tokens de démonstration pré-configurés (cliquez pour tester) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Token VIP Cyber (10 Gbps)', code: 'ATRS-VIP-7788-X99' },
                  { label: 'Token Pro Neo (2.5 Gbps)', code: 'ATRS-PRO-2026-NEO' },
                  { label: 'Token Expiré (Test erreur)', code: 'ATRS-EXP-0000-OLD' },
                ].map((demo) => (
                  <button
                    key={demo.code}
                    onClick={() => {
                      setInputToken(demo.code);
                      handleValidate(demo.code);
                    }}
                    className="text-[10px] font-mono-tech px-2 py-1 rounded bg-white/5 border border-slate-700 hover:border-[#00E5FF] text-slate-300 hover:text-white transition-colors"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legal / Sandbox Notice */}
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 font-rajdhani flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Mode Démonstration & Sécurité : Les licences sont validées cryptographiquement par le protocole Antares Token Service. Aucun système de paiement fictif non vérifié n'est exécuté.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060312] border-t border-slate-800 text-center">
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
