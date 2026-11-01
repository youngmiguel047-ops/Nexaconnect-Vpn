/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  FileCode, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Server, 
  Lock, 
  Trash2,
  FileCheck
} from 'lucide-react';
import { AtrsConfig, VpnServer } from '../types/vpn';
import { AtrsParser, ParseResult } from '../utils/atrsParser';
import { SAMPLE_ATRS_CYBER_PROFILE, SAMPLE_ATRS_STREAMING_PROFILE } from '../data/sampleAtrs';
import { cyberAudio } from '../utils/audio';

interface AtrsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (config: AtrsConfig, servers: VpnServer[]) => void;
  currentConfig: AtrsConfig | null;
  onClearConfig: () => void;
}

export const AtrsImportModal: React.FC<AtrsImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  currentConfig,
  onClearConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleProcessFileContent = (content: string, name: string) => {
    setFileName(name);
    setRawText(content);
    const result = AtrsParser.parse(content);
    setParseResult(result);
    if (result.success) {
      cyberAudio.playConnect();
    } else {
      cyberAudio.playGlitch();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessFileContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleApplyConfig = () => {
    if (parseResult && parseResult.success && parseResult.config) {
      cyberAudio.playClick();
      onImportSuccess(parseResult.config, parseResult.servers);
      onClose();
    }
  };

  const handleDownloadSample = () => {
    cyberAudio.playClick();
    const blob = new Blob([SAMPLE_ATRS_CYBER_PROFILE], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'antares_stealth_tokyo.atrs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#080516] border border-[#00E5FF]/40 shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0C0720]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF]">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-base text-white tracking-wide">
                Importation Profil .ATRS
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Antares Tunnel Routing Specification v{AtrsParser.CURRENT_VERSION}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Configuration Overview (if present) */}
          {currentConfig && (
            <div className="p-3.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-[#00FF88]" />
                <div>
                  <span className="text-[10px] font-mono-tech uppercase text-[#00E5FF]">
                    Profil ATRS Actif
                  </span>
                  <h4 className="font-orbitron font-bold text-xs text-white">
                    {currentConfig.configName}
                  </h4>
                  <span className="text-[11px] text-slate-300 font-mono-tech">
                    {currentConfig.servers.length} serveurs • Signé : {currentConfig.author}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  onClearConfig();
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-[#FF3155] hover:bg-[#FF3155]/10"
                title="Supprimer la configuration active"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  handleProcessFileContent(event.target?.result as string, file.name);
                };
                reader.readAsText(file);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-[#00E5FF] bg-[#00E5FF]/15'
                : 'border-slate-700 bg-black/40 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".atrs,.json"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-[#00E5FF] mb-2" />
            <h4 className="font-orbitron font-bold text-xs text-white">
              Déposez votre fichier .atrs ici
            </h4>
            <p className="text-xs text-slate-400 font-rajdhani mt-1">
              ou cliquez pour parcourir vos fichiers Android (.atrs, .json)
            </p>
          </div>

          {/* Preset Sample Profiles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono-tech uppercase text-slate-400">
              Ou charger un profil type officiel Antares :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleProcessFileContent(SAMPLE_ATRS_CYBER_PROFILE, 'tokyo_stealth.atrs')}
                className="p-2.5 rounded-lg bg-[#0E0926] border border-slate-700 hover:border-[#00E5FF] text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-orbitron font-bold text-white">Tokyo Cyber Stealth</div>
                  <div className="text-[10px] font-mono-tech text-slate-400">3 serveurs • Hysteria 2 / VLESS</div>
                </div>
                <span className="text-[10px] font-mono-tech text-[#00E5FF]">Charger</span>
              </button>

              <button
                onClick={() => handleProcessFileContent(SAMPLE_ATRS_STREAMING_PROFILE, 'streaming_vip.atrs')}
                className="p-2.5 rounded-lg bg-[#0E0926] border border-slate-700 hover:border-[#FF00E5] text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-orbitron font-bold text-white">VIP 4K Streaming Pack</div>
                  <div className="text-[10px] font-mono-tech text-slate-400">2 serveurs • US / Frankfurt</div>
                </div>
                <span className="text-[10px] font-mono-tech text-[#FF00E5]">Charger</span>
              </button>
            </div>
          </div>

          {/* Inspection / Parsing Status */}
          {parseResult && (
            <div
              className={`p-4 rounded-xl border ${
                parseResult.success
                  ? 'border-[#00FF88]/40 bg-[#00FF88]/10'
                  : 'border-[#FF3155]/40 bg-[#FF3155]/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {parseResult.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                    <span className="font-orbitron font-bold text-xs text-[#00FF88]">
                      Fichier valide : {parseResult.config?.configName}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-[#FF3155]" />
                    <span className="font-orbitron font-bold text-xs text-[#FF3155]">
                      Erreur de validation ATRS
                    </span>
                  </>
                )}
              </div>

              {parseResult.success && parseResult.config ? (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono-tech text-[11px] pb-2 border-b border-slate-700/60">
                    <div>Version : v{parseResult.config.version}</div>
                    <div>Signataire : {parseResult.config.author}</div>
                    <div>DNS Primaire : {parseResult.config.dns.primary}</div>
                    <div>Règles : {parseResult.config.routing.bypassLan ? 'Bypass LAN' : 'Full Route'}</div>
                  </div>

                  <span className="text-[10px] font-mono-tech uppercase text-slate-400 block pt-1">
                    Nœuds inclus ({parseResult.servers.length}) :
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {parseResult.servers.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{srv.flag}</span>
                          <span className="font-bold text-white">{srv.name}</span>
                          <span className="text-[10px] font-mono-tech text-slate-400">
                            ({srv.protocol})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono-tech text-[#00E5FF]">
                          <Lock className="w-3 h-3 text-[#00FF88]" />
                          <span>UUID Masqué</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleApplyConfig}
                    className="w-full mt-3 py-2.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#00FF88] text-black font-orbitron font-bold text-xs tracking-wide hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                  >
                    Importer et Activer cette Configuration
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-300 font-mono-tech">
                  {parseResult.error}
                </p>
              )}
            </div>
          )}

          {/* Download Sample Button */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-400 font-rajdhani">
            <span>Besoin d'un fichier .atrs d'exemple sur votre appareil ?</span>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1 text-[11px] font-mono-tech text-[#00E5FF] hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger .atrs
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060310] border-t border-slate-800 text-center">
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
