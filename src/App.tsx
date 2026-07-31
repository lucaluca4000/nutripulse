import React, { useState, useEffect } from 'react';
import { DailyLog, FoodItem, MealType, UserProfile, UserAccount } from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadFoodLogs,
  saveFoodLogs,
  loadDailyLogs,
  saveDailyLogs,
  getTodayDateString,
} from './utils/storage';
import { getCurrentSessionUser, logoutSession } from './utils/authStorage';
import { Header } from './components/Header';
import { CalorieGauge } from './components/Dashboard/CalorieGauge';
import { WaterTracker } from './components/Dashboard/WaterTracker';
import { MealSection } from './components/Dashboard/MealSection';
import { ProfileWizardModal } from './components/Wizard/ProfileWizardModal';
import { OnboardingModal } from './components/Wizard/OnboardingModal';
import { PhotoAnalyzerModal } from './components/AiScanner/PhotoAnalyzerModal';
import { TextAnalyzerModal } from './components/AiScanner/TextAnalyzerModal';
import { BarcodeScannerModal } from './components/BarcodeScanner/BarcodeScannerModal';
import { QuickAddModal } from './components/QuickAddModal';
import { HistoryCharts } from './components/Progress/HistoryCharts';
import { FoodRecommendations } from './components/Recommendations/FoodRecommendations';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileQuickActionSheet } from './components/MobileQuickActionSheet';
import { AuthModal } from './components/Auth/AuthModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { NotificationPromptModal } from './components/Notifications/NotificationPromptModal';
import { NotificationSettingsModal } from './components/Notifications/NotificationSettingsModal';
import { InAppNotificationToast } from './components/Notifications/InAppNotificationToast';
import { getNotificationSettings, checkAndTriggerReminders } from './utils/notifications';
import { Plus, Camera, UtensilsCrossed, ScanBarcode, Calculator, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentSessionUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState<boolean>(false);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState<boolean>(false);
  const [activeToastMessage, setActiveToastMessage] = useState<string | null>(null);
  const [isMobileActionSheetOpen, setIsMobileActionSheetOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('nutripulse_onboarding_completed');
  });

  // User-scoped Data States
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile(currentUser?.id));
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>(() => loadFoodLogs(currentUser?.id));
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() => loadDailyLogs(currentUser?.id));

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'photo' | 'text' | 'barcode' | 'profile' | 'history' | 'recommendations'>('dashboard');

  // Modal controls
  const [activeAddMealType, setActiveAddMealType] = useState<MealType | null>(null);

  // Re-sync states when currentUser changes (e.g., login, register, logout)
  useEffect(() => {
    const userId = currentUser?.id;
    setProfile(loadUserProfile(userId));
    setFoodLogs(loadFoodLogs(userId));
    setDailyLogs(loadDailyLogs(userId));
  }, [currentUser?.id]);

  // Prompt user for notification permissions on launch if not yet answered
  useEffect(() => {
    const notifSettings = getNotificationSettings();
    if (!notifSettings.promptAnswered && !isOnboardingOpen) {
      const timer = setTimeout(() => {
        setIsNotificationPromptOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOnboardingOpen]);

  // Periodic interval check for scheduled reminders (runs every 25 seconds)
  useEffect(() => {
    const runCheck = () => {
      const result = checkAndTriggerReminders();
      if (result.inAppMessage) {
        setActiveToastMessage(result.inAppMessage);
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserAccount) => {
    saveUserProfile(profile, user.id);
    saveFoodLogs(foodLogs, user.id);
    saveDailyLogs(dailyLogs, user.id);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
  };

  // Sync profile to user-scoped localStorage
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile, currentUser?.id);
  };

  // Sync food logs to user-scoped localStorage
  const handleAddFoodLog = (item: Omit<FoodItem, 'id' | 'timestamp' | 'date'>) => {
    const newLogItem: FoodItem = {
      ...item,
      id: 'food-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      date: selectedDate,
      timestamp: Date.now(),
    };

    const updated = [newLogItem, ...foodLogs];
    setFoodLogs(updated);
    saveFoodLogs(updated, currentUser?.id);
    setActiveAddMealType(null);
    setCurrentTab('dashboard');
  };

  const handleDeleteFoodItem = (id: string) => {
    const updated = foodLogs.filter((item) => item.id !== id);
    setFoodLogs(updated);
    saveFoodLogs(updated, currentUser?.id);
  };

  const handleUpdateServing = (id: string, newGrams: number) => {
    const updated = foodLogs.map((item) => {
      if (item.id === id) {
        const ratio = newGrams / (item.servingSizeGrams || 100);
        return {
          ...item,
          servingSizeGrams: newGrams,
          portionName: `${newGrams}g`,
          calories: Math.round(item.calories * ratio),
          protein: Math.round(item.protein * ratio * 10) / 10,
          carbs: Math.round(item.carbs * ratio * 10) / 10,
          fat: Math.round(item.fat * ratio * 10) / 10,
        };
      }
      return item;
    });
    setFoodLogs(updated);
    saveFoodLogs(updated, currentUser?.id);
  };

  // Water intake sync
  const currentDailyLog = dailyLogs[selectedDate] || { date: selectedDate, waterIntakeMl: 0 };

  const handleUpdateWater = (newAmountMl: number) => {
    const updatedDaily: Record<string, DailyLog> = {
      ...dailyLogs,
      [selectedDate]: {
        ...currentDailyLog,
        waterIntakeMl: newAmountMl,
      },
    };
    setDailyLogs(updatedDaily);
    saveDailyLogs(updatedDaily, currentUser?.id);
  };

  const handleUpdateWeight = (newWeightKg: number) => {
    const updatedProf = { ...profile, weightKg: newWeightKg };
    setProfile(updatedProf);
    saveUserProfile(updatedProf, currentUser?.id);
  };

  // Filter logs for selected date
  const selectedDateLogs = foodLogs.filter((item) => item.date === selectedDate);

  const breakfastItems = selectedDateLogs.filter((item) => item.mealType === 'breakfast');
  const lunchItems = selectedDateLogs.filter((item) => item.mealType === 'lunch');
  const dinnerItems = selectedDateLogs.filter((item) => item.mealType === 'dinner');
  const snackItems = selectedDateLogs.filter((item) => item.mealType === 'snack');

  const totalCaloriesLogged = selectedDateLogs.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinLogged = Math.round(selectedDateLogs.reduce((sum, item) => sum + item.protein, 0));
  const totalCarbsLogged = Math.round(selectedDateLogs.reduce((sum, item) => sum + item.carbs, 0));
  const totalFatLogged = Math.round(selectedDateLogs.reduce((sum, item) => sum + item.fat, 0));
  const totalFiberLogged = Math.round(selectedDateLogs.reduce((sum, item) => sum + (item.fiber || 0), 0));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-28 md:pb-16">
      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        profile={profile}
        totalCaloriesLogged={totalCaloriesLogged}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-12">
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Action Banner */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Saisie Intelligente</span>
                  <h2 className="font-black uppercase italic tracking-tight text-base sm:text-lg text-white">Que souhaitez-vous analyser ?</h2>
                  <p className="text-xs text-zinc-400">Analyse de photos, description NLP ou scan EAN par l'IA Gemini.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto overflow-x-auto text-[11px] font-black uppercase tracking-wider">
                <button
                  onClick={() => setCurrentTab('photo')}
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-lime-400/10 whitespace-nowrap"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Photo</span>
                </button>
                <button
                  onClick={() => setCurrentTab('text')}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl border border-zinc-700 transition-all flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-lime-400" />
                  <span>Décrire Repas</span>
                </button>
                <button
                  onClick={() => setCurrentTab('barcode')}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl border border-zinc-700 transition-all flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <ScanBarcode className="w-3.5 h-3.5 text-lime-400" />
                  <span>Code-Barres</span>
                </button>
              </div>
            </div>

            {/* Calorie & Macro Gauge */}
            <CalorieGauge
              profile={profile}
              totalCalories={totalCaloriesLogged}
              totalProtein={totalProteinLogged}
              totalCarbs={totalCarbsLogged}
              totalFat={totalFatLogged}
              totalFiber={totalFiberLogged}
              onOpenProfileWizard={() => setCurrentTab('profile')}
              onOpenRecommendations={() => setCurrentTab('recommendations')}
            />

            {/* AI Recommendation Banner Widget */}
            <div
              onClick={() => setCurrentTab('recommendations')}
              className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-lime-400/30 rounded-2xl p-5 cursor-pointer hover:border-lime-400 transition-all shadow-xl group flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-lime-400/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 fill-black" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">IA CONSEILS NUTRITION</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                      Reste {Math.max(0, profile.targetCalories - totalCaloriesLogged)} kcal
                    </span>
                  </div>
                  <h3 className="text-base font-black uppercase italic tracking-tight text-white mt-0.5">
                    Besoin d'idées de repas adaptées à vos macros ?
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Obtenez 3 suggestions de repas personnalisées (Petit-Déj, Déjeuner, Dîner, En-cas) pré-calculées par Gemini.
                  </p>
                </div>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider shrink-0 transition-all flex items-center space-x-1.5 shadow-md shadow-lime-400/10">
                <span>Voir Conseils IA</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Water Tracker Widget */}
            <WaterTracker
              waterIntakeMl={currentDailyLog.waterIntakeMl || 0}
              targetWaterMl={profile.targetWaterMl}
              onUpdateWater={handleUpdateWater}
            />

            {/* Meal Sections Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold block mb-1">Journal Quotidien</span>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">REPAS ENREGISTRÉS</h2>
                </div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
                  {selectedDateLogs.length} Entrée{selectedDateLogs.length > 1 ? 's' : ''}
                </span>
              </div>

              <MealSection
                mealType="breakfast"
                title="Petit-Déjeuner"
                items={breakfastItems}
                onDeleteItem={handleDeleteFoodItem}
                onUpdateServing={handleUpdateServing}
                onOpenAddModal={(type) => setActiveAddMealType(type)}
              />

              <MealSection
                mealType="lunch"
                title="Déjeuner"
                items={lunchItems}
                onDeleteItem={handleDeleteFoodItem}
                onUpdateServing={handleUpdateServing}
                onOpenAddModal={(type) => setActiveAddMealType(type)}
              />

              <MealSection
                mealType="dinner"
                title="Dîner"
                items={dinnerItems}
                onDeleteItem={handleDeleteFoodItem}
                onUpdateServing={handleUpdateServing}
                onOpenAddModal={(type) => setActiveAddMealType(type)}
              />

              <MealSection
                mealType="snack"
                title="En-cas & Collation"
                items={snackItems}
                onDeleteItem={handleDeleteFoodItem}
                onUpdateServing={handleUpdateServing}
                onOpenAddModal={(type) => setActiveAddMealType(type)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PHOTO SCANNER */}
        {currentTab === 'photo' && (
          <PhotoAnalyzerModal
            onAddFoodLog={handleAddFoodLog}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}

        {/* TAB 3: TEXT DESCRIPTION */}
        {currentTab === 'text' && (
          <TextAnalyzerModal
            onAddFoodLog={handleAddFoodLog}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}

        {/* TAB 4: BARCODE SCANNER */}
        {currentTab === 'barcode' && (
          <BarcodeScannerModal
            onAddFoodLog={handleAddFoodLog}
            onClose={() => setCurrentTab('dashboard')}
          />
        )}

        {/* TAB 5: PROFILE & CALCULATOR WIZARD */}
        {currentTab === 'profile' && (
          <ProfileWizardModal
            profile={profile}
            onSaveProfile={handleUpdateProfile}
            onClose={() => setCurrentTab('dashboard')}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            onLogout={handleLogout}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenNotificationModal={() => setIsNotificationSettingsOpen(true)}
          />
        )}

        {/* TAB 6: HISTORY & PROGRESS */}
        {currentTab === 'history' && (
          <HistoryCharts
            foodLogs={foodLogs}
            profile={profile}
            onUpdateWeightLog={handleUpdateWeight}
          />
        )}

        {/* TAB 7: AI FOOD RECOMMENDATIONS */}
        {currentTab === 'recommendations' && (
          <FoodRecommendations
            profile={profile}
            remainingCalories={profile.targetCalories - totalCaloriesLogged}
            remainingProtein={profile.targetProtein - totalProteinLogged}
            remainingCarbs={profile.targetCarbs - totalCarbsLogged}
            remainingFat={profile.targetFat - totalFatLogged}
            onAddMealItem={handleAddFoodLog}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* QUICK ADD MODAL DIALOG */}
      {activeAddMealType && (
        <QuickAddModal
          defaultMealType={activeAddMealType}
          onAddFoodLog={handleAddFoodLog}
          onClose={() => setActiveAddMealType(null)}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenActionHub={() => setIsMobileActionSheetOpen(true)}
      />

      {/* MOBILE QUICK ACTION SHEET */}
      <MobileQuickActionSheet
        isOpen={isMobileActionSheetOpen}
        onClose={() => setIsMobileActionSheetOpen(false)}
        onSelectAction={(action, mealType) => {
          if (action === 'quick_add') {
            setActiveAddMealType(mealType || 'lunch');
          } else {
            setCurrentTab(action);
          }
        }}
      />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* LANGUAGE SELECTOR MODAL */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* DOWNLOAD / INSTALL APP MODAL */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        currentUser={currentUser}
      />

      {/* FIRST-TIME ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
        onClose={() => {
          setIsOnboardingOpen(false);
          const notifSettings = getNotificationSettings();
          if (!notifSettings.promptAnswered) {
            setTimeout(() => setIsNotificationPromptOpen(true), 500);
          }
        }}
      />

      {/* INITIAL NOTIFICATION PERMISSION PROMPT MODAL */}
      <NotificationPromptModal
        isOpen={isNotificationPromptOpen}
        onClose={() => setIsNotificationPromptOpen(false)}
      />

      {/* NOTIFICATION SETTINGS MODAL */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        onTestNotificationSent={(msg) => setActiveToastMessage(msg)}
      />

      {/* IN-APP TOAST NOTIFICATION BANNER */}
      <InAppNotificationToast
        message={activeToastMessage}
        onClose={() => setActiveToastMessage(null)}
      />
    </div>
  );
}
