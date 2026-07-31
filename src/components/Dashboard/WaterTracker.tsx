import React from 'react';
import { Droplet, Plus, Minus, CheckCircle2 } from 'lucide-react';

interface WaterTrackerProps {
  waterIntakeMl: number;
  targetWaterMl: number;
  onUpdateWater: (newAmountMl: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterIntakeMl,
  targetWaterMl,
  onUpdateWater,
}) => {
  const pct = Math.min(100, Math.round((waterIntakeMl / targetWaterMl) * 100));
  const totalGlasses = 8; // 8 glasses of 250ml = 2000ml
  const filledGlasses = Math.min(totalGlasses, Math.floor(waterIntakeMl / 250));

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-xl border border-zinc-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/30">
            <Droplet className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold block mb-0.5">Hydratation</span>
            <h3 className="font-black uppercase italic tracking-tight text-base text-white">Suivi d'Hydratation Quotidien</h3>
            <p className="text-xs text-zinc-400 font-mono">
              {(waterIntakeMl / 1000).toFixed(2)} L / {(targetWaterMl / 1000).toFixed(2)} L recommandés
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
          {pct}% Atteint
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-cyan-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Visual Glasses Icons */}
      <div className="flex items-center justify-between mb-6 px-2">
        {Array.from({ length: totalGlasses }).map((_, idx) => (
          <div
            key={idx}
            onClick={() => onUpdateWater((idx + 1) * 250)}
            className={`cursor-pointer transform hover:scale-110 transition-all p-1 rounded-lg ${
              idx < filledGlasses
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                : 'text-zinc-700 hover:text-zinc-500'
            }`}
            title={`Verre ${idx + 1} (250ml)`}
          >
            <Droplet className={`w-6 h-6 ${idx < filledGlasses ? 'fill-cyan-400 text-cyan-400' : ''}`} />
          </div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateWater(Math.max(0, waterIntakeMl - 250))}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700 transition-colors text-zinc-300"
            title="Moins 250ml"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateWater(waterIntakeMl + 250)}
            className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold uppercase tracking-wider rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-cyan-400/10 text-[11px]"
          >
            <Plus className="w-4 h-4" />
            <span>+ 250 ml (1 verre)</span>
          </button>
          <button
            onClick={() => onUpdateWater(waterIntakeMl + 500)}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold uppercase tracking-wider rounded-xl border border-zinc-700 transition-colors flex items-center space-x-1.5 text-[11px]"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>+ 500 ml (1 gourde)</span>
          </button>
        </div>

        {pct >= 100 && (
          <div className="flex items-center space-x-1.5 text-lime-400 font-bold uppercase text-[10px] tracking-wider bg-lime-400/10 px-3 py-1.5 rounded-xl border border-lime-400/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Hydratation optimale !</span>
          </div>
        )}
      </div>
    </div>
  );
};
