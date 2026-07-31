import React from 'react';
import { Flame, Camera, ScanBarcode, UtensilsCrossed, User, LineChart, ChevronLeft, ChevronRight, Calendar, Sparkles, LogIn, LogOut, Globe, Download, Bell } from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { useLanguage } from '../context/LanguageContext';

import logoImg from '../assets/images/nutripulse_logo_1785324265038.jpg';

import { triggerApkDownload } from '../utils/downloadUtils';

interface HeaderProps {
  currentTab: 'dashboard' | 'photo' | 'text' | 'barcode' | 'profile' | 'history' | 'recommendations';
  setCurrentTab: (tab: 'dashboard' | 'photo' | 'text' | 'barcode' | 'profile' | 'history' | 'recommendations') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  profile: UserProfile;
  totalCaloriesLogged: number;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenLanguageModal: () => void;
  onOpenDownloadModal?: () => void;
  onOpenNotificationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedDate,
  setSelectedDate,
  profile,
  totalCaloriesLogged,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenLanguageModal,
  onOpenDownloadModal,
  onOpenNotificationModal,
}) => {
  const { currentLanguage, t } = useLanguage();

  // Date manipulation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Aujourd’hui';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Hier';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Demain';

    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const calorieRemaining = profile.targetCalories - totalCaloriesLogged;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl font-sans w-full overflow-hidden">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1 min-w-0">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer group shrink min-w-0"
            onClick={() => setCurrentTab('dashboard')}
          >
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl overflow-hidden ring-2 ring-lime-400/40 shadow-md shadow-lime-400/15 group-hover:ring-lime-400 transition-all shrink-0">
              <img
                src={logoImg}
                alt="NutriPulse AI Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="min-w-0">
              <span className="hidden sm:block text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-lime-400 font-extrabold leading-tight">
                PRECISION NUTRITION
              </span>
              <h1 className="text-xs sm:text-xl font-black tracking-tight uppercase italic text-white leading-none truncate">
                NutriPulse<span className="text-lime-400">.AI</span>
              </h1>
            </div>
          </div>

          {/* Desktop Center: Date Picker Control */}
          <div className="hidden md:flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 text-xs font-mono shadow-inner">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Jour précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1.5 px-3 font-semibold text-zinc-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-lime-400" />
              <span>{formatDateDisplay(selectedDate)}</span>
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Jour suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isToday && (
              <button
                onClick={handleToday}
                className="px-2 py-1 bg-lime-400 text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-lime-300 transition-colors ml-1"
              >
                Aujourd'hui
              </button>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* Quick Calorie Target Summary (Desktop) */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="hidden lg:flex items-center space-x-2 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 px-3 py-1.5 rounded-xl transition-all text-zinc-300 text-xs font-mono"
            >
              <span className="font-bold text-white">{profile.targetCalories} kcal</span>
              <span className="text-zinc-700">|</span>
              <span className={calorieRemaining >= 0 ? 'text-lime-400 font-bold' : 'text-rose-400 font-bold'}>
                {calorieRemaining >= 0 ? `${calorieRemaining} rst` : `${Math.abs(calorieRemaining)} dpt`}
              </span>
            </button>

            {/* Download / Install App Button */}
            {onOpenDownloadModal && (
              <button
                onClick={() => {
                  triggerApkDownload();
                  onOpenDownloadModal();
                }}
                className="h-8 sm:h-9 px-2 sm:px-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl border border-lime-400 flex items-center space-x-1 text-xs active:scale-95 shrink-0 shadow-lg shadow-lime-400/20"
                title="Télécharger l'application NutriPulse APK"
              >
                <Download className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline text-xs font-black uppercase">Télécharger App</span>
              </button>
            )}

            {/* Language Selector Button */}
            <button
              onClick={onOpenLanguageModal}
              className="h-8 sm:h-9 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all border border-zinc-800 flex items-center justify-center text-xs font-mono active:scale-95 shrink-0"
              title={t('select_language', 'Langue de l’application')}
            >
              <span className="text-xs sm:text-sm leading-none">{currentLanguage.flag}</span>
              <span className="font-bold text-[10px] hidden sm:inline-block uppercase ml-1">{currentLanguage.code}</span>
            </button>

            {/* Notifications Settings Button */}
            {onOpenNotificationModal && (
              <button
                onClick={onOpenNotificationModal}
                className="h-8 sm:h-9 w-8 sm:w-9 bg-zinc-900 hover:bg-zinc-800 text-lime-400 hover:text-lime-300 rounded-xl transition-all border border-zinc-800 flex items-center justify-center shrink-0 active:scale-95 relative"
                title="Paramètres des rappels & notifications"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </button>
            )}

            {/* Account Status Badge or Login */}
            {currentUser ? (
              <div
                onClick={() => setCurrentTab('profile')}
                className="h-8 sm:h-9 flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 border border-lime-400/30 p-1 pl-1.5 sm:pl-2 rounded-xl text-xs font-mono cursor-pointer shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-lime-400 text-black flex items-center justify-center font-black text-[9px] uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="font-bold text-white truncate max-w-[32px] sm:max-w-[80px] text-[10px] sm:text-[11px]">
                  {currentUser.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                  title={t('logout', 'Se déconnecter')}
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal('register')}
                className="h-8 sm:h-9 px-2 sm:px-3 bg-lime-400 hover:bg-lime-300 text-black rounded-xl text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1 shadow-md active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{t('create_account', 'Connexion')}</span>
              </button>
            )}

            {/* Profile Settings Icon Button */}
            <button
              onClick={() => setCurrentTab('profile')}
              className="h-8 sm:h-9 w-8 sm:w-9 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all border border-zinc-800 flex items-center justify-center shrink-0 active:scale-95"
              title={t('profile', 'Profil & Besoins Caloriques')}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Bar: Dedicated Sleek Date Bar on Mobile (< md) */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-zinc-800/60 font-mono text-xs">
          <div className="flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 w-full justify-between shadow-inner">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">Préc.</span>
            </button>

            <div className="flex items-center space-x-1.5 px-2 font-black text-white text-xs">
              <Calendar className="w-3.5 h-3.5 text-lime-400" />
              <span>{formatDateDisplay(selectedDate)}</span>
            </div>

            <div className="flex items-center space-x-1">
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="px-2 py-0.5 bg-lime-400 text-black text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-lime-300 transition-colors"
                >
                  Aujourd'hui
                </button>
              )}
              <button
                onClick={handleNextDay}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center space-x-1"
              >
                <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">Suiv.</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Hidden on small mobile, visible on desktop/tablet */}
        <nav className="hidden md:flex items-center space-x-2 overflow-x-auto py-2.5 scrollbar-none border-t border-zinc-800/80 text-[11px] uppercase tracking-wider font-extrabold">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{t('dashboard', 'Tableau de bord')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('recommendations')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'recommendations'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-lime-400 fill-lime-400/20" />
            <span>{t('ai_recipes', 'Conseils & Recettes IA')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('photo')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'photo'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('scan_photo', 'Scan Photo IA')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'text'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>{t('describe_meal', 'Décrire un repas')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('barcode')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'barcode'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <ScanBarcode className="w-4 h-4" />
            <span>{t('barcode', 'Code-barres')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'history'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>{t('history', 'Historique & Progrès')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              currentTab === 'profile'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('profile', 'Calculateur Besoins')}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
