import React, { useState } from 'react';
import { FoodItem, UserProfile } from '../../types';
import { LineChart, Calendar, Scale, TrendingDown, TrendingUp, Sparkles, Award } from 'lucide-react';

interface HistoryChartsProps {
  foodLogs: FoodItem[];
  profile: UserProfile;
  onUpdateWeightLog?: (newWeightKg: number) => void;
}

export const HistoryCharts: React.FC<HistoryChartsProps> = ({
  foodLogs,
  profile,
  onUpdateWeightLog,
}) => {
  const [newWeight, setNewWeight] = useState(profile.weightKg.toString());

  // Group logs by date
  const dateMap: Record<string, FoodItem[]> = {};
  foodLogs.forEach((item) => {
    if (!dateMap[item.date]) dateMap[item.date] = [];
    dateMap[item.date].push(item);
  });

  const sortedDates = Object.keys(dateMap).sort().reverse();

  // Weight progress calculations
  const weightDiff = profile.weightKg - profile.targetWeightKg;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (val && onUpdateWeightLog) {
      onUpdateWeightLog(val);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto my-4 font-sans">
      {/* Weight Tracker Overview Card */}
      <div className="bg-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-zinc-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-0.5">Progression</span>
              <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Suivi de Poids & Objectif</h3>
              <p className="text-xs text-zinc-400 font-mono">
                Poids actuel: <span className="font-bold text-white">{profile.weightKg} kg</span> • Poids cible: <span className="font-bold text-lime-400">{profile.targetWeightKg} kg</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleWeightSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-24 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm font-bold font-mono focus:ring-2 focus:ring-lime-400 focus:outline-none"
              placeholder="Ex: 74.5"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md"
            >
              Mettre à jour
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-center text-xs font-mono">
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Différence vers l'objectif</span>
            <span className="text-xl font-black italic text-lime-400 mt-1 block">
              {weightDiff > 0 ? `-${weightDiff.toFixed(1)} kg à perdre` : weightDiff < 0 ? `+${Math.abs(weightDiff).toFixed(1)} kg à prendre` : 'Objectif atteint ! 🎉'}
            </span>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Cible Calories/Jour</span>
            <span className="text-xl font-black italic text-cyan-400 mt-1 block">{profile.targetCalories} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
          </div>
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
            <span className="text-zinc-500 text-[10px] block font-bold uppercase tracking-wider">Besoin Protéines</span>
            <span className="text-xl font-black italic text-lime-400 mt-1 block">{profile.targetProtein} <span className="text-xs font-normal text-zinc-500">g / jour</span></span>
          </div>
        </div>
      </div>

      {/* Daily Logs Timeline History */}
      <div className="bg-zinc-900 text-white rounded-2xl border border-zinc-800 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
          <Calendar className="w-5 h-5 text-lime-400" />
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-lime-400 font-bold block mb-0.5">Timeline</span>
            <h3 className="font-black uppercase italic tracking-tight text-lg text-white">Historique des Journées Enregistrées</h3>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6 font-mono">Aucun historique disponible.</p>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((dateStr) => {
              const dayItems = dateMap[dateStr];
              const dayCal = dayItems.reduce((s, i) => s + i.calories, 0);
              const dayP = Math.round(dayItems.reduce((s, i) => s + i.protein, 0));
              const dayC = Math.round(dayItems.reduce((s, i) => s + i.carbs, 0));
              const dayF = Math.round(dayItems.reduce((s, i) => s + i.fat, 0));

              const pctCal = Math.min(100, Math.round((dayCal / profile.targetCalories) * 100));

              return (
                <div key={dateStr} className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-white text-sm sm:text-base font-mono">{dateStr}</span>
                      <span className="text-xs text-zinc-400 block font-medium">
                        {dayItems.length} aliment{dayItems.length > 1 ? 's' : ''} enregistré{dayItems.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-lg font-black text-lime-400">{dayCal}</span>
                      <span className="text-xs text-zinc-500 font-bold"> / {profile.targetCalories} kcal</span>
                    </div>
                  </div>

                  {/* Daily Progress Bar */}
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full ${
                        pctCal <= 100 ? 'bg-lime-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pctCal}%` }}
                    />
                  </div>

                  {/* Daily Macro Summary */}
                  <div className="flex items-center space-x-4 text-xs font-mono font-bold pt-1">
                    <span className="text-lime-400">Prot: {dayP}g</span>
                    <span className="text-cyan-400">Glu: {dayC}g</span>
                    <span className="text-amber-400">Lip: {dayF}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
