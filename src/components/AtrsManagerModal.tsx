/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileCode, 
  Upload, 
  Download, 
  Check, 
  Trash2, 
  Edit3, 
  Play, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { SavedAtrsProfile, VpnServer, AtrsConfig } from '../types/vpn';
import { AtrsParser } from '../utils/atrsParser';
import { cyberAudio } from '../utils/audio';

interface AtrsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (server: VpnServer, atrsConfig?: AtrsConfig) => void;
  onEditProfile: (server: VpnServer) => void;
  onOpenCreateNew: () => void;
  activeServerId?: string;
}

export const AtrsManagerModal: React.FC<AtrsManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
  onEditProfile,
  onOpenCreateNew,
  activeServerId,
}) => {
  const [profiles, setProfiles] = useState<SavedAtrsProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState<SavedAtrsProfile | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isExportingId, setIsExportingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadProfiles = () => {
    const list = AtrsParser.getSavedAtrsProfiles();
    setProfiles(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      setFeedbackMessage(null);
      setSelectedForDelete(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Export single profile
  const handleExportProfile = async (profile: SavedAtrsProfile) => {
    cyberAudio.playClick();
    setIsExportingId(profile.id);

    try {
      const res = await AtrsParser.saveAtrsFileToDisk(profile.fileContent, profile.fileName);
      setIsExportingId(null);

      if (res.success) {
        cyberAudio.playConnect();
        showToast(`Fichier exporté avec succès : ${res.fileName}`, 'success');
      } else if (res.error) {
        cyberAudio.playGlitch();
        showToast(res.error, 'error');
      }
    } catch (e: any) {
      setIsExportingId(null);
      cyberAudio.playGlitch();
      showToast(`Échec d'exportation : ${e?.message || 'Erreur inconnue'}`, 'error');
    }
  };

  // Delete profile
  const handleConfirmDelete = () => {
    if (!selectedForDelete) return;
    cyberAudio.playClick();
    AtrsParser.deleteAtrsProfile(selectedForDelete.id);
    setSelectedForDelete(null);
    loadProfiles();
    cyberAudio.playDisconnect();
    showToast(`Configuration supprimée : ${selectedForDelete.name}`, 'success');
  };

  // Select profile to connect
  const handleSelect = (profile: SavedAtrsProfile) => {
    cyberAudio.playConnect();
    AtrsParser.setActiveProfile(profile.id);
    loadProfiles();
    onSelectProfile(profile.server);
    showToast(`Configuration activée : ${profile.name}`, 'success');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  // Import file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = AtrsParser.parse(content);

      if (res.success && res.server) {
        cyberAudio.playConnect();
        const configName = res.configName || file.name.replace(/\.atrs$/i, '');
        const saved = AtrsParser.saveAtrsProfile({
          name: configName,
          fileName: file.name,
          server: res.server,
          fileContent: res.atrsFile,
        });

        loadProfiles();
        showToast(`Configuration importée et enregistrée : ${saved.name} (${saved.fileName})`, 'success');
      } else {
        cyberAudio.playGlitch();
        showToast(res.error || 'Fichier .ATRS non valide ou corrompu.', 'error');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.fileName.toLowerCase().includes(q) ||
      p.server.ip.toLowerCase().includes(q) ||
      (p.server.sni && p.server.sni.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-[#070314] border border-[#00E5FF]/60 shadow-[0_0_50px_rgba(0,229,255,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0E0624]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#8B00FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center">
              <FileCode className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-bold text-sm sm:text-base text-white tracking-wide">
                  Mes configurations ATRS
                </h3>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40">
                  {profiles.length} FICHIERS .ATRS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Format de fichier propriétaire Antares VPN • Import, export et exécution réelle
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-mono-tech flex items-center justify-between border-b ${
              feedbackMessage.type === 'success'
                ? 'bg-[#00FF88]/15 border-[#00FF88]/40 text-[#00FF88]'
                : 'bg-[#FF3155]/15 border-[#FF3155]/40 text-[#FF3155]'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Actions Bar (Search + Import + Add) */}
        <div className="p-3 bg-[#0A041C] border-b border-slate-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, serveur, SNI..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 focus:border-[#00E5FF] text-white text-xs font-mono-tech outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".atrs,.ATRS,.json"
              className="hidden"
            />
            
            <button
              onClick={() => {
                cyberAudio.playClick();
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF] font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer un fichier .ATRS</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playClick();
                onClose();
                onOpenCreateNew();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF00E5] to-[#8B00FF] hover:brightness-110 text-white font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(255,0,229,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau VLESS</span>
            </button>
          </div>
        </div>

        {/* Configurations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {filteredProfiles.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500">
                <FileCode className="w-7 h-7" />
              </div>
              <div>
                <p className="font-orbitron font-bold text-sm text-white">
                  Aucune configuration ATRS trouvée
                </p>
                <p className="text-xs text-slate-400 font-rajdhani mt-1 max-w-xs">
                  Créez une configuration manuelle VLESS ou importez un fichier .ATRS existant pour commencer.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-orbitron font-bold text-xs hover:bg-[#00E5FF]/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Importer un fichier .ATRS</span>
              </button>
            </div>
          ) : (
            filteredProfiles.map((prof) => {
              const isActive = prof.isActive || prof.server.id === activeServerId;
              const isExporting = isExportingId === prof.id;

              return (
                <div
                  key={prof.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#00FF88]/10 border-[#00FF88]/60 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                      : 'bg-[#0A041C]/80 border-slate-800 hover:border-[#00E5FF]/40 hover:bg-[#0D0524]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Custom ATRS Icon & details */}
                    <div className="flex items-start gap-3 min-w-0">
                      {/* High-Tech ATRS Icon Badge */}
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex flex-col items-center justify-center border font-orbitron font-black text-[9px] tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.4)]'
                          : 'bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                      }`}>
                        <FileCode className="w-4 h-4 mb-0.5" />
                        <span>.ATRS</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white truncate">
                            {prof.name}
                          </h4>
                          {isActive && (
                            <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 font-bold">
                              ACTIF
                            </span>
                          )}
                          <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {prof.fileName}
                          </span>
                        </div>

                        {/* Technical details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 mt-1.5 text-[11px] font-mono-tech text-slate-300">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Cible :</span>
                            <span className="text-white font-semibold truncate block">
                              {prof.server.ip}:{prof.server.port}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Transport :</span>
                            <span className="text-[#00E5FF] font-semibold uppercase">
                              {prof.server.transport || 'ws'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Sécurité :</span>
                            <span className="text-[#FF00E5] font-semibold uppercase">
                              {prof.server.security || 'tls'}
                            </span>
                          </div>
                          {prof.server.wsHost && (
                            <div className="col-span-2 truncate">
                              <span className="text-slate-500 text-[10px] block">Header Host :</span>
                              <span className="text-amber-300 truncate block">
                                {prof.server.wsHost}
                              </span>
                            </div>
                          )}
                          {prof.server.sni && (
                            <div className="truncate">
                              <span className="text-slate-500 text-[10px] block">SNI :</span>
                              <span className="text-emerald-400 truncate block">
                                {prof.server.sni}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick status */}
                    <span className="text-[10px] font-mono-tech text-slate-500 flex-shrink-0">
                      {new Date(prof.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {/* Actions Bar for each card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Select & Activate Button */}
                      <button
                        onClick={() => handleSelect(prof)}
                        className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88]'
                            : 'bg-gradient-to-r from-[#00E5FF] to-[#00FF88] text-black hover:brightness-110 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isActive ? 'Sélectionné' : 'Activer & Connecter'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          cyberAudio.playClick();
                          onClose();
                          onEditProfile(prof.server);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-orbitron font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Modifier cette configuration dans le formulaire manuel"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>Modifier</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Export to .ATRS file button */}
                      <button
                        onClick={() => handleExportProfile(prof)}
                        disabled={isExporting}
                        className="px-3 py-1.5 rounded-lg bg-[#FF00E5]/15 hover:bg-[#FF00E5]/25 border border-[#FF00E5]/40 text-[#FF00E5] text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Télécharger et exporter ce fichier .ATRS sur votre appareil"
                      >
                        <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
                        <span>Exporter .ATRS</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          cyberAudio.playClick();
                          setSelectedForDelete(prof);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF3155] hover:bg-[#FF3155]/15 transition-colors cursor-pointer"
                        title="Supprimer ce profil ATRS"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060310] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono-tech text-slate-400">
            Fichiers conformes à la spécification Antares .ATRS v1
          </span>
          <button
            onClick={() => {
              cyberAudio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-orbitron font-semibold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm p-4 rounded-xl bg-[#0E0620] border border-[#FF3155]/60 shadow-[0_0_30px_rgba(255,49,85,0.4)] space-y-3">
            <div className="flex items-center gap-2.5 text-[#FF3155]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h4 className="font-orbitron font-bold text-sm text-white">
                Supprimer la configuration ?
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-rajdhani">
              Voulez-vous vraiment supprimer le fichier <strong>{selectedForDelete.fileName}</strong> ({selectedForDelete.name}) de vos configurations enregistrées ?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedForDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-orbitron text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-[#FF3155] hover:bg-red-600 text-white font-orbitron font-bold text-xs transition-colors cursor-pointer shadow-[0_0_12px_rgba(255,49,85,0.5)]"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
