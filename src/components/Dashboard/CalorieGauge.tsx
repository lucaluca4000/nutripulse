import React from 'react';
import { UserProfile } from '../../types';
import { Flame, Zap, Droplet, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface CalorieGaugeProps {
  profile: UserProfile;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  onOpenProfileWizard: () => void;
  onOpenRecommendations?: () => void;
}

export const CalorieGauge: React.FC<CalorieGaugeProps> = ({
  profile,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  totalFiber,
  onOpenProfileWizard,
  onOpenRecommendations,
}) => {
  const targetCal = profile.targetCalories;
  const remainingCal = targetCal - totalCalories;
  const progressCalPct = Math.min(100, Math.round((totalCalories / targetCal) * 100));

  // SVG Ring calculation
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressCalPct / 100) * circumference;

  // Macro Pcts
  const pPct = Math.min(100, Math.round((totalProtein / profile.targetProtein) * 100));
  const cPct = Math.min(100, Math.round((totalCarbs / profile.targetCarbs) * 100));
  const fPct = Math.min(100, Math.round((totalFat / profile.targetFat) * 100));
  const fibPct = Math.min(100, Math.round((totalFiber / profile.targetFiber) * 100));

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl p-6 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Circular Calorie Progress Gauge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="text-zinc-800"
                strokeWidth="16"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="text-lime-400 transition-all duration-1000 ease-out"
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-1">Total Caloric</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter italic">{totalCalories}</span>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ {targetCal} KCAL</span>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                    remainingCal >= 0
                      ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {remainingCal >= 0 ? `${remainingCal} kcal restants` : `${Math.abs(remainingCal)} kcal dépassées`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span>Objectif: <strong className="text-white font-bold">{targetCal} kcal</strong></span>
              <span>•</span>
              <button
                onClick={onOpenProfileWizard}
                className="text-lime-400 font-bold hover:underline uppercase text-[10px] tracking-wider"
              >
                Modifier Cibles
              </button>
            </div>

            {onOpenRecommendations && (
              <button
                onClick={onOpenRecommendations}
                className="mt-1 px-4 py-2 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 fill-lime-400/30" />
                <span>Recommandations Repas IA</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Detailed Macro Progress Bars */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Macro Profil</span>
              <h3 className="text-base font-black uppercase italic tracking-tight text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span>Répartition des Macronutriments</span>
              </h3>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Consommé vs Objectif</span>
          </div>

          {/* Protein Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block" />
                <span>Protéines</span>
              </span>
              <span className="text-white font-black italic">
                {totalProtein}g <span className="text-zinc-500 font-normal text-xs">/ {profile.targetProtein}g</span>
                <span className="ml-2 text-xs font-mono text-lime-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">{pPct}%</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full transition-all duration-700"
                style={{ width: `${pPct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider font-mono">
              {profile.targetProtein - totalProtein > 0
                ? `Reste ${profile.targetProtein - totalProtein}g nécessaires`
                : 'Objectif protéines atteint ! 🔥'}
            </p>
          </div>

          {/* Carbs Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                <span>Glucides</span>
              </span>
              <span className="text-white font-black italic">
                {totalCarbs}g <span className="text-zinc-500 font-normal text-xs">/ {profile.targetCarbs}g</span>
                <span className="ml-2 text-xs font-mono text-cyan-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">{cPct}%</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${cPct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider font-mono">
              {profile.targetCarbs - totalCarbs > 0
                ? `Reste ${profile.targetCarbs - totalCarbs}g`
                : 'Limite glucides atteinte'}
            </p>
          </div>

          {/* Fat Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Lipides (Graisses)</span>
              </span>
              <span className="text-white font-black italic">
                {totalFat}g <span className="text-zinc-500 font-normal text-xs">/ {profile.targetFat}g</span>
                <span className="ml-2 text-xs font-mono text-amber-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">{fPct}%</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${fPct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 text-right uppercase tracking-wider font-mono">
              {profile.targetFat - totalFat > 0
                ? `Reste ${profile.targetFat - totalFat}g`
                : 'Limite lipides atteinte'}
            </p>
          </div>

          {/* Fiber Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Fibres alimentaires</span>
              </span>
              <span className="text-white font-black italic">
                {totalFiber}g <span className="text-zinc-500 font-normal text-xs">/ {profile.targetFiber}g</span>
                <span className="ml-2 text-xs font-mono text-emerald-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">{fibPct}%</span>
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${fibPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
