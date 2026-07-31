import React, { useState } from 'react';
import { ActivityLevel, Gender, Goal, MacroPreset, UserProfile, UserAccount } from '../../types';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MACRO_PRESETS, calculateUserProfileTargets } from '../../utils/calculator';
import { Calculator, Check, Sparkles, User, Dumbbell, Target, PieChart, ShieldCheck, RefreshCw, LogIn, LogOut, Lock, Globe, Download, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../data/languages';

interface ProfileWizardModalProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
  onOpenLanguageModal?: () => void;
  onOpenDownloadModal?: () => void;
  onOpenOnboarding?: () => void;
  onOpenNotificationModal?: () => void;
}

export const ProfileWizardModal: React.FC<ProfileWizardModalProps> = ({
  profile,
  onSaveProfile,
  onClose,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenLanguageModal,
  onOpenDownloadModal,
  onOpenOnboarding,
  onOpenNotificationModal,
}) => {
  const { currentLanguage, setLanguageCode, t } = useLanguage();

  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.heightCm);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<Goal>(profile.goal);
  const [macroPreset, setMacroPreset] = useState<MacroPreset>(profile.macroPreset);

  const [customP, setCustomP] = useState(profile.customProteinRatio || 0.3);
  const [customC, setCustomC] = useState(profile.customCarbsRatio || 0.4);
  const [customF, setCustomF] = useState(profile.customFatRatio || 0.3);

  // Active step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Live computed stats
  const liveProfile = calculateUserProfileTargets({
    age,
    gender,
    heightCm,
    weightKg,
    targetWeightKg,
    activityLevel,
    goal,
    macroPreset,
    customProteinRatio: customP,
    customCarbsRatio: customC,
    customFatRatio: customF,
  });

  const handleSave = () => {
    onSaveProfile(liveProfile);
    if (onClose) onClose();
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden max-w-4xl mx-auto my-4 font-sans">
      {/* Modal Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-0.5">Calculateur Besoins</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">Profil & Besoins Nutritionnels</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Déterminez scientifiquement votre Métabolisme de Base (BMR), votre TDEE et vos cibles de macro/micronutriments.
            </p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            {onOpenNotificationModal && (
              <button
                type="button"
                onClick={onOpenNotificationModal}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-lime-400/30 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Bell className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Rappels 🔔</span>
              </button>
            )}
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assistant Onboarding</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 mt-6 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-xs font-extrabold uppercase tracking-wider">
          <button
            onClick={() => setStep(1)}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              step === 1 ? 'bg-lime-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">1. Mesures</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              step === 2 ? 'bg-lime-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">2. Activité</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              step === 3 ? 'bg-lime-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">3. Objectif</span>
          </button>
          <button
            onClick={() => setStep(4)}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              step === 4 ? 'bg-lime-400 text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">4. Macros</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Account Info Banner */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0 font-bold">
              {currentUser ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
                  {currentUser ? 'COMPTE VÉRIFIÉ' : 'MODE LOCAL / INVITÉ'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {currentUser ? `Bienvenue, ${currentUser.name}` : 'Sauvegardez vos données avec un mot de passe'}
              </h3>
              <p className="text-xs text-zinc-400">
                {currentUser
                  ? `Compte associé à ${currentUser.email}`
                  : 'Créez un compte gratuitement pour conserver votre profil et votre journal de nutrition.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-lime-400/10"
                >
                  Créer Compte
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Language Preference Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  PARAMÈTRE DE LANGUE / LANGUAGE SETTING
                </span>
                <span className="text-[9px] bg-lime-400 text-black px-1.5 py-0.2 rounded font-mono font-black">
                  {LANGUAGES.length} langues
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center space-x-2 mt-0.5">
                <span>Langue actuelle :</span>
                <span className="text-lime-400 font-mono font-bold flex items-center space-x-1.5">
                  <span className="text-lg">{currentLanguage.flag}</span>
                  <span>{currentLanguage.nativeName} ({currentLanguage.name})</span>
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                L’interface de l'application et les réponses de l’IA s’adapteront à la langue sélectionnée.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-lime-400/30 hover:border-lime-400 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Globe className="w-4 h-4" />
              <span>Changer de langue (+30)</span>
            </button>
          </div>
        </div>

        {/* Download App Card */}
        {onOpenDownloadModal && (
          <div className="bg-gradient-to-r from-lime-950/30 via-zinc-950 to-zinc-950 border border-lime-400/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0 font-bold shadow-md">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
                    APPLICATION MOBILE & DESKTOP (PWA)
                  </span>
                  <span className="text-[9px] bg-emerald-400 text-black px-1.5 py-0.2 rounded font-mono font-black">
                    MÊME COMPTE 🔄
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                  Télécharger NutriPulse sur votre écran d'accueil
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Installez l'app sur iPhone, Android ou PC. Vos comptes et votre historique restent 100% synchronisés !
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-lime-400/20 shrink-0"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Télécharger L'App</span>
            </button>
          </div>
        )}

        {/* STEP 1: Personal Measurements */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Étape 1 sur 4</span>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-lime-400" />
                <span>Informations Personnelles</span>
              </h3>
              <p className="text-xs text-zinc-400">Calcul du métabolisme basal via l'équation de Mifflin-St Jeor.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Sexe biologique</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-center ${
                      gender === 'male'
                        ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-black'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Homme 👨
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-center ${
                      gender === 'female'
                        ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-black'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Femme 👩
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('other')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-center ${
                      gender === 'other'
                        ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-black'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Autre 🧑
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Âge (ans)</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Math.max(12, parseInt(e.target.value) || 18))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono font-bold focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Taille (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(100, parseInt(e.target.value) || 170))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono font-bold focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>

              {/* Current Weight */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Poids actuel (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(30, parseFloat(e.target.value) || 70))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono font-bold focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>

              {/* Target Weight */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Poids cible souhaité (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  step="0.5"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Math.max(30, parseFloat(e.target.value) || 70))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono font-bold focus:ring-2 focus:ring-lime-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Activity Level */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Étape 2 sur 4</span>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-lime-400" />
                <span>Niveau d'Activité Physique</span>
              </h3>
              <p className="text-xs text-zinc-400">Le facteur d'activité (PAL) évalue votre dépense calorique quotidienne totale (TDEE).</p>
            </div>

            <div className="space-y-3">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                const item = ACTIVITY_MULTIPLIERS[key];
                const isSelected = activityLevel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivityLevel(key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-lime-400/10 border-lime-400 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-black uppercase tracking-wider text-sm ${isSelected ? 'text-lime-400' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 font-mono text-lime-400 border border-zinc-700 font-bold">
                          x{item.factor}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center text-black shrink-0 font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Goal Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Étape 3 sur 4</span>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-lime-400" />
                <span>Objectif Physique & Calorie</span>
              </h3>
              <p className="text-xs text-zinc-400">Déficit ou surplus calorique à appliquer selon vos buts.</p>
            </div>

            <div className="space-y-3">
              {(Object.keys(GOAL_ADJUSTMENTS) as Goal[]).map((key) => {
                const item = GOAL_ADJUSTMENTS[key];
                const isSelected = goal === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGoal(key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-lime-400/10 border-lime-400 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-black uppercase tracking-wider text-sm ${isSelected ? 'text-lime-400' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 font-mono text-zinc-300 font-semibold border border-zinc-700">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center text-black shrink-0 font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Macro Preset & Customization */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Étape 4 sur 4</span>
              <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-lime-400" />
                <span>Répartition des Macronutriments</span>
              </h3>
              <p className="text-xs text-zinc-400">Sélectionnez la répartition Protéines / Glucides / Lipides.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(MACRO_PRESETS) as MacroPreset[]).map((key) => {
                const item = MACRO_PRESETS[key];
                const isSelected = macroPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMacroPreset(key)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-lime-400/10 border-lime-400 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-black uppercase tracking-wider text-sm text-white flex items-center justify-between">
                      <span className={isSelected ? 'text-lime-400' : 'text-white'}>{item.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-lime-400" />}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                  </button>
                );
              })}
            </div>

            {macroPreset === 'custom' && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Ajuster les Ratios Personnalisés</h4>
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="flex justify-between font-semibold text-zinc-300">
                      <span>Protéines: {Math.round(customP * 100)}%</span>
                      <span className="text-lime-400 font-bold">({Math.round((liveProfile.targetCalories * customP) / 4)}g)</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.05"
                      value={customP}
                      onChange={(e) => setCustomP(parseFloat(e.target.value))}
                      className="w-full accent-lime-400"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-zinc-300">
                      <span>Glucides: {Math.round(customC * 100)}%</span>
                      <span className="text-cyan-400 font-bold">({Math.round((liveProfile.targetCalories * customC) / 4)}g)</span>
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.7"
                      step="0.05"
                      value={customC}
                      onChange={(e) => setCustomC(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between font-semibold text-zinc-300">
                      <span>Lipides: {Math.round(customF * 100)}%</span>
                      <span className="text-amber-400 font-bold">({Math.round((liveProfile.targetCalories * customF) / 9)}g)</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.7"
                      step="0.05"
                      value={customF}
                      onChange={(e) => setCustomF(parseFloat(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIVE SCIENTIFIC BREAKDOWN SUMMARY */}
        <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-lime-400" />
              <h4 className="font-black uppercase italic tracking-tight text-base text-white">Résultats Calculés en Temps Réel</h4>
            </div>
            <span className="text-[10px] bg-zinc-900 text-lime-400 font-mono font-bold px-2.5 py-1 rounded-md border border-zinc-800 uppercase tracking-widest">
              Formule Mifflin-St Jeor
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {/* BMR */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-bold">BMR (Métabolisme)</span>
              <span className="text-lg sm:text-xl font-black italic text-white mt-0.5 block">{liveProfile.bmr} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
              <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">Repos absolu</span>
            </div>

            {/* TDEE */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-bold">TDEE (Dépense Totale)</span>
              <span className="text-lg sm:text-xl font-black italic text-cyan-400 mt-0.5 block">{liveProfile.tdee} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
              <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">Avec activité</span>
            </div>

            {/* Target Calories */}
            <div className="p-3 bg-lime-400/10 rounded-xl border border-lime-400/30 col-span-2 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-widest text-lime-400 block font-black">Objectif Calorique Quotidien</span>
              <span className="text-2xl sm:text-3xl font-black text-white italic mt-0.5 block">{liveProfile.targetCalories} <span className="text-sm font-normal text-lime-400 font-mono">kcal / jour</span></span>
              <span className="text-[10px] text-zinc-400 block mt-0.5 uppercase tracking-wider font-mono">
                {GOAL_ADJUSTMENTS[liveProfile.goal]?.name}
              </span>
            </div>
          </div>

          {/* Detailed Macro & Micro Target Grid */}
          <div className="space-y-3 pt-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-lime-400">Objectifs de Macro & Micro-Nutriments</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Protéines</span>
                  <span className="font-black text-lime-400 text-sm">{liveProfile.targetProtein}g</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Glucides</span>
                  <span className="font-black text-cyan-400 text-sm">{liveProfile.targetCarbs}g</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Lipides</span>
                  <span className="font-black text-amber-400 text-sm">{liveProfile.targetFat}g</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] font-semibold uppercase">Fibres</span>
                  <span className="font-black text-emerald-400 text-sm">{liveProfile.targetFiber}g</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Hydration & Micros */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono pt-1 text-zinc-300">
              <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase">Eau Recommandée</span>
                <span className="font-bold text-cyan-400">{(liveProfile.targetWaterMl / 1000).toFixed(1)} Litres/j</span>
              </div>
              <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase">Sodium Max</span>
                <span className="font-bold text-zinc-200">{liveProfile.targetSodiumMg} mg</span>
              </div>
              <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase">Calcium</span>
                <span className="font-bold text-zinc-200">{liveProfile.targetCalciumMg} mg</span>
              </div>
              <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px] uppercase">Vitamine C</span>
                <span className="font-bold text-zinc-200">{liveProfile.targetVitaminCMg} mg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-lime-400" />
            <span>Vos cibles seront appliquées instantanément à votre tableau de bord.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-bold uppercase tracking-wider hover:bg-zinc-800 text-xs transition-colors w-1/2 sm:w-auto"
              >
                Précédent
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs transition-colors shadow-md shadow-lime-400/10 w-1/2 sm:w-auto text-center"
              >
                Étape Suivante
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs transition-all shadow-md shadow-lime-400/20 flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer & Appliquer Mes Cibles</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
