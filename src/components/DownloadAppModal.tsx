import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  ExternalLink,
  Layers,
  SmartphoneCharging,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { UserAccount } from '../types';
import { triggerApkDownload } from '../utils/downloadUtils';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ios' | 'apk' | 'guide'>('ios');
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  useEffect(() => {
    // Auto detect if user is on iOS / iPhone / iPad
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setActiveTab('ios');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    triggerApkDownload();
    setDownloadStarted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glow bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-lime-400/20 to-lime-400/5 border border-lime-400/30 flex items-center justify-center text-lime-400 shadow-lg shadow-lime-400/10 shrink-0">
              <Download className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide truncate">
                  Installer NutriPulse.AI sur Mobile
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-lime-400 text-black px-2 py-0.5 rounded-full font-mono font-black shrink-0">
                  iOS & Android
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
                iPhone (Écran d'accueil) ou Téléchargement APK Android direct.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-2xl transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Sync Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-lime-950/30 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80">
          <div className="flex items-center space-x-3 text-xs">
            <div className="p-1.5 bg-lime-400/10 text-lime-400 rounded-xl shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-xs sm:text-sm truncate">
                  {currentUser ? `Compte actif : ${currentUser.name}` : 'Sauvegarde et synchronisation Cloud automatique'}
                </span>
                <span className="bg-lime-400/20 text-lime-300 border border-lime-400/30 text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0">
                  Cloud Sync 🔄
                </span>
              </div>
            </div>
          </div>
        </div>

        {downloadStarted && (
          <div className="px-4 py-3 bg-lime-400/15 border-b border-lime-400/30 flex items-center justify-between text-xs text-lime-300 font-bold animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
              <span>Fichier <strong>NutriPulse-AI-v1.0.apk</strong> téléchargé avec succès !</span>
            </div>
            <button
              onClick={() => setDownloadStarted(false)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800/80 flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('ios')}
            className={`px-4 py-2 rounded-xl font-black flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'ios'
                ? 'bg-lime-400 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>iPhone / iOS (Safari) 📱</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`px-4 py-2 rounded-xl font-black flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'apk'
                ? 'bg-lime-400 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
            }`}
          >
            <SmartphoneCharging className="w-4 h-4" />
            <span>Android (Fichier .APK)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
              activeTab === 'guide'
                ? 'bg-lime-400 text-black shadow-md font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guide & Support</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[50vh] space-y-4">
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-5 rounded-2xl border-2 border-sky-400/50 space-y-3 shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-sky-400/10 text-sky-400 rounded-xl">
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">
                      Installer sur iPhone & iPad (sans App Store)
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Sur iOS (iPhone), Apple n'autorise pas les fichiers <code>.apk</code>. Vous pouvez installer NutriPulse directement en Web App (PWA) native en 10 secondes !
                    </p>
                  </div>
                </div>
              </div>

              {/* iOS Instructions */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Share className="w-4 h-4 text-sky-400" />
                  <span>Étapes d'installation sur iPhone :</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="w-7 h-7 rounded-xl bg-sky-400/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">1</span>
                    <div>
                      <p className="text-white font-bold">Ouvrez le site dans Safari</p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">Assurez-vous d'ouvrir cette page web avec l'application <strong>Safari</strong> de votre iPhone.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="w-7 h-7 rounded-xl bg-sky-400/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">2</span>
                    <div>
                      <p className="text-white font-bold flex items-center gap-1.5">
                        Appuyez sur le bouton Partager <Share className="w-4 h-4 text-sky-400 inline" />
                      </p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">En bas au centre de l'écran de votre iPhone (ou en haut sur iPad), appuyez sur l'icône de partage (carré avec flèche vers le haut).</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="w-7 h-7 rounded-xl bg-sky-400/20 text-sky-400 font-black flex items-center justify-center text-xs shrink-0">3</span>
                    <div>
                      <p className="text-white font-bold flex items-center gap-1.5">
                        Faites défiler et touchez <PlusSquare className="w-4 h-4 text-lime-400 inline" /> "Sur l'écran d'accueil"
                      </p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">Dans le menu qui s'affiche, faites défiler vers le bas et sélectionnez <strong>"Sur l'écran d'accueil"</strong> (ou "Add to Home Screen").</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="w-7 h-7 rounded-xl bg-lime-400 text-black font-black flex items-center justify-center text-xs shrink-0">4</span>
                    <div>
                      <p className="text-white font-bold">Appuyez sur "Ajouter"</p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">L'icône NutriPulse.AI apparaîtra directement sur l'écran d'accueil de votre iPhone, sans barres de navigateur et avec les notifications actives !</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/90 p-5 rounded-2xl border-2 border-lime-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-lime-400/10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <h3 className="font-black text-white text-base">
                      Fichier d'installation Android NutriPulse
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Téléchargez le fichier <strong>NutriPulse-AI-v1.0.apk</strong> directement sur votre téléphone Android.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={handleDownloadApk}
                    className="px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-lime-400/25 flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <Download className="w-5 h-5 stroke-[3]" />
                    <span>Télécharger NutriPulse.apk</span>
                  </button>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-lime-400" />
                  <span>Comment installer l'APK sur Android :</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start space-x-3 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                    <span className="w-6 h-6 rounded-lg bg-lime-400/20 text-lime-400 font-black flex items-center justify-center text-xs shrink-0">1</span>
                    <p className="text-zinc-300">Cliquez sur <strong>"Télécharger NutriPulse.apk"</strong> ci-dessus.</p>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                    <span className="w-6 h-6 rounded-lg bg-lime-400/20 text-lime-400 font-black flex items-center justify-center text-xs shrink-0">2</span>
                    <p className="text-zinc-300">Ouvrez la notification de téléchargement ou le fichier <strong>NutriPulse-AI-v1.0.apk</strong> dans vos Téléchargements.</p>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                    <span className="w-6 h-6 rounded-lg bg-lime-400/20 text-lime-400 font-black flex items-center justify-center text-xs shrink-0">3</span>
                    <p className="text-zinc-300">Si Android affiche un message de sécurité, appuyez sur <strong>Paramètres</strong> → Activez <strong>"Autoriser cette source"</strong> (ou "Installer des apps inconnues").</p>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
                    <span className="w-6 h-6 rounded-lg bg-lime-400 text-black font-black flex items-center justify-center text-xs shrink-0">4</span>
                    <p className="text-zinc-300">Appuyez sur <strong>Installer</strong>. L'application NutriPulse s'ajoute sur votre smartphone avec son icône native !</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h3 className="font-black text-white text-sm uppercase tracking-wider">
                Résolution des blocages d'installation Android
              </h3>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-xs text-amber-200">
                <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Message "Problème lors de l'analyse du package" ou "Source inconnue" ?</span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Sur Android, lorsqu'un fichier <code>.apk</code> est téléchargé en dehors du Play Store, le système de sécurité d'Android (Google Play Protect) peut bloquer l'ouverture par défaut.
                </p>
                
                <div className="space-y-2 pt-1">
                  <p className="font-bold text-white text-xs">Pour débloquer l'installation en 5 secondes :</p>
                  <ol className="list-decimal list-inside text-zinc-300 space-y-1.5 text-[11px] pl-1">
                    <li>Allez dans les <strong>Paramètres</strong> de votre téléphone Android.</li>
                    <li>Cherchez <strong>Sécurité</strong> ou <strong>Applications & Notifications</strong>.</li>
                    <li>Appuyez sur <strong>Installation d'applications de sources inconnues</strong>.</li>
                    <li>Sélectionnez <strong>Chrome</strong> (ou votre gestionnaire de Fichiers) et cochez <strong>Autoriser</strong>.</li>
                    <li>Ré-ouvrez le fichier <strong>NutriPulse-AI-v1.0.apk</strong> et appuyez sur <strong>Installer</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center space-x-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>Fichier binaire Android NutriPulse APK sécurisé</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadApk}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl transition-colors shadow-md active:scale-95 uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Télécharger .apk</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-colors border border-zinc-800"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

