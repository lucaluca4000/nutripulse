import React, { useState } from 'react';
import { ActivityLevel, Gender, Goal, MacroPreset, UserProfile } from '../../types';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MACRO_PRESETS, calculateUserProfileTargets } from '../../utils/calculator';
import { Sparkles, User, Dumbbell, Target, PieChart, Check, ArrowRight, ArrowLeft, HeartPulse } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface OnboardingModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  profile,
  onSaveProfile,
  onClose,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states initialized with current profile
  const [age, setAge] = useState<number>(profile.age || 26);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 178);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 74);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(profile.targetWeightKg || 74);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [goal, setGoal] = useState<Goal>(profile.goal || 'maintain');
  const [macroPreset, setMacroPreset] = useState<MacroPreset>(profile.macroPreset || 'balanced');

  if (!isOpen) return null;

  // Compute live targets
  const liveProfile = calculateUserProfileTargets({
    age,
    gender,
    heightCm,
    weightKg,
    targetWeightKg,
    activityLevel,
    goal,
    macroPreset,
    customProteinRatio: profile.customProteinRatio || 0.3,
    customCarbsRatio: profile.customCarbsRatio || 0.4,
    customFatRatio: profile.customFatRatio || 0.3,
  });

  const handleCompleteOnboarding = () => {
    onSaveProfile(liveProfile);
    localStorage.setItem('nutripulse_onboarding_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-lime-400/30 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto relative">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 p-6 sm:p-8 border-b border-zinc-800 relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/20 font-black">
              <HeartPulse className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-lime-400 font-extrabold block mb-0.5">
                Bienvenue sur NutriPulse.AI ⚡
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">
                Personnalisation de votre Profil
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Répondez à 4 étapes rapides pour calculer scientifiquement votre Métabolisme de Base (BMR), TDEE et objectifs de macros.
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-zinc-400 mb-2">
              <span className={step >= 1 ? 'text-lime-400' : ''}>1. Biométrie</span>
              <span className={step >= 2 ? 'text-lime-400' : ''}>2. Activité</span>
              <span className={step >= 3 ? 'text-lime-400' : ''}>3. Objectif</span>
              <span className={step >= 4 ? 'text-lime-400' : ''}>4. Macros & Cibles</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="bg-lime-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: BIOMETRIC INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-l-2 border-lime-400 pl-3">
                <h3 className="text-base font-black uppercase italic text-white">Étape 1 : Vos Mesures Corporelles</h3>
                <p className="text-xs text-zinc-400">Ces informations nous permettent de calculer votre Métabolisme de Base (Formule Mifflin-St Jeor).</p>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">Genre biologique</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-center space-x-2 font-extrabold text-sm uppercase ${
                      gender === 'male'
                        ? 'bg-lime-400/10 border-lime-400 text-lime-300 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>Homme ♂</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-center space-x-2 font-extrabold text-sm uppercase ${
                      gender === 'female'
                        ? 'bg-lime-400/10 border-lime-400 text-lime-300 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>Femme ♀</span>
                  </button>
                </div>
              </div>

              {/* Age, Height, Weight inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">Âge (ans)</label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Math.max(12, parseInt(e.target.value) || 25))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">Taille (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(100, parseInt(e.target.value) || 175))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">Poids Actuel (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Math.max(30, parseFloat(e.target.value) || 70))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Weight */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-1">Poids Cible Souhaité (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="300"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Math.max(30, parseFloat(e.target.value) || 70))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-lime-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVITY LEVEL */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-l-2 border-lime-400 pl-3">
                <h3 className="text-base font-black uppercase italic text-white">Étape 2 : Votre Niveau d'Activité Quotidienne</h3>
                <p className="text-xs text-zinc-400">Le niveau d'activité permet de déterminer la dépense énergétique totale (TDEE).</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                  const info = ACTIVITY_MULTIPLIERS[key];
                  const isSelected = activityLevel === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActivityLevel(key)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-black text-sm uppercase ${isSelected ? 'text-lime-300' : 'text-white'}`}>
                            {info.name}
                          </span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">
                            x{info.factor}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{info.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'border-lime-400 bg-lime-400 text-black' : 'border-zinc-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: GOAL SELECTION */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-l-2 border-lime-400 pl-3">
                <h3 className="text-base font-black uppercase italic text-white">Étape 3 : Votre Objectif Principal</h3>
                <p className="text-xs text-zinc-400">Sélectionnez le type d'ajustement calorique souhaité pour atteindre vos buts.</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(GOAL_ADJUSTMENTS) as Goal[]).map((key) => {
                  const info = GOAL_ADJUSTMENTS[key];
                  const isSelected = goal === key;
                  const pct = Math.round((info.multiplier - 1) * 100);
                  const pctText = pct > 0 ? `+${pct}%` : `${pct}%`;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGoal(key)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-lime-400/10 border-lime-400 shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-black text-sm uppercase ${isSelected ? 'text-lime-300' : 'text-white'}`}>
                            {info.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            pct > 0 ? 'bg-emerald-500/20 text-emerald-300' : pct < 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {pctText}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{info.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected ? 'border-lime-400 bg-lime-400 text-black' : 'border-zinc-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: MACROS & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-l-2 border-lime-400 pl-3">
                <h3 className="text-base font-black uppercase italic text-white">Étape 4 : Vos Cibles Calculées en Temps Réel</h3>
                <p className="text-xs text-zinc-400">Voici vos cibles caloriques et la répartition recommandée de macronutriments.</p>
              </div>

              {/* Macro Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-2">Profil de Macronutriments</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(MACRO_PRESETS) as MacroPreset[]).map((key) => {
                    const preset = MACRO_PRESETS[key];
                    const isSelected = macroPreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMacroPreset(key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-lime-400/10 border-lime-400 text-lime-300 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="block text-xs font-extrabold uppercase">{preset.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                          P: {Math.round(preset.pRatio * 100)}% | G: {Math.round(preset.cRatio * 100)}% | L: {Math.round(preset.fRatio * 100)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Calculated Stats Card */}
              <div className="p-5 bg-zinc-900 border border-lime-400/40 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Objectif Calorique Quotidien</span>
                  <span className="text-2xl font-black text-lime-400 font-mono italic">
                    {liveProfile.targetCalories} <span className="text-xs font-sans text-zinc-400 uppercase">kcal/jour</span>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-lime-400 font-bold block uppercase font-sans">Protéines</span>
                    <span className="text-base font-black text-white">{liveProfile.targetProtein}g</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase font-sans">Glucides</span>
                    <span className="text-base font-black text-white">{liveProfile.targetCarbs}g</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase font-sans">Lipides</span>
                    <span className="text-base font-black text-white">{liveProfile.targetFat}g</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase font-sans">Fibres</span>
                    <span className="text-base font-black text-white">{liveProfile.targetFiber}g</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Métabolisme de Base (BMR) : <strong className="text-white font-mono">{liveProfile.bmr} kcal</strong></span>
                  <span>Hydratation : <strong className="text-cyan-400 font-mono">{(liveProfile.targetWaterMl / 1000).toFixed(2)}L</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Passer pour l'instant
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md shadow-lime-400/10 ml-auto"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteOnboarding}
              className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-xl shadow-lime-400/20 ml-auto"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Valider mon profil & Démarrer 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
