import React from 'react';
import { FoodItem, MealType } from '../../types';
import { Coffee, Sun, Moon, Cookie, Plus, Trash2, Info, Sparkles, Scale, Droplets } from 'lucide-react';
import { isLiquidFood } from '../../data/foodDatabase';

interface MealSectionProps {
  mealType: MealType;
  title: string;
  items: FoodItem[];
  onDeleteItem: (id: string) => void;
  onUpdateServing: (id: string, newGrams: number) => void;
  onOpenAddModal: (mealType: MealType) => void;
}

const MEAL_CONFIG: Record<MealType, { icon: React.ReactNode; label: string }> = {
  breakfast: {
    icon: <Coffee className="w-5 h-5 text-lime-400" />,
    label: 'PETIT-DÉJEUNER',
  },
  lunch: {
    icon: <Sun className="w-5 h-5 text-cyan-400" />,
    label: 'DÉJEUNER',
  },
  dinner: {
    icon: <Moon className="w-5 h-5 text-amber-400" />,
    label: 'DÎNER',
  },
  snack: {
    icon: <Cookie className="w-5 h-5 text-emerald-400" />,
    label: 'EN-CAS & COLLATION',
  },
};

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  title,
  items,
  onDeleteItem,
  onUpdateServing,
  onOpenAddModal,
}) => {
  const cfg = MEAL_CONFIG[mealType];

  const totalCal = items.reduce((sum, item) => sum + item.calories, 0);
  const totalP = Math.round(items.reduce((sum, item) => sum + item.protein, 0));
  const totalC = Math.round(items.reduce((sum, item) => sum + item.carbs, 0));
  const totalF = Math.round(items.reduce((sum, item) => sum + item.fat, 0));

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      {/* Meal Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            {cfg.icon}
          </div>
          <div>
            <h3 className="font-black uppercase italic text-base tracking-tight text-white">{title}</h3>
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
              <span>{items.length} aliment{items.length > 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-lime-400 font-bold">{totalP}g Prot</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">{totalC}g Glu</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{totalF}g Lip</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-xl font-black italic tracking-tight text-white">{totalCal}</span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest block">KCAL</span>
          </div>

          <button
            onClick={() => onOpenAddModal(mealType)}
            className="px-3.5 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1 text-[10px] shadow-md shadow-lime-400/10"
            title="Ajouter un aliment"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Item List */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 text-xs font-mono">
          <p>Aucun aliment enregistré pour ce repas.</p>
          <button
            onClick={() => onOpenAddModal(mealType)}
            className="mt-2 inline-flex items-center space-x-1 text-lime-400 font-bold uppercase tracking-wider hover:underline text-[10px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter avec photo, texte ou scanner</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 hover:bg-zinc-800/40 transition-colors space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  {/* Item Image Thumbnail if Vision or Barcode */}
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                      {item.source === 'barcode' ? (
                        <Scale className="w-5 h-5 text-lime-400" />
                      ) : (
                        <Coffee className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-bold text-white text-sm sm:text-base">{item.name}</h4>
                      {item.nutriScore && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            item.nutriScore === 'A'
                              ? 'bg-lime-400 text-black'
                              : item.nutriScore === 'B'
                              ? 'bg-emerald-500 text-black'
                              : item.nutriScore === 'C'
                              ? 'bg-yellow-400 text-black'
                              : item.nutriScore === 'D'
                              ? 'bg-orange-500 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          Nutri-Score {item.nutriScore}
                        </span>
                      )}
                      {item.source === 'ai_vision' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-lime-400" />
                          <span>IA Vision</span>
                        </span>
                      )}
                      {item.source === 'barcode' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                          Code-barres
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                      Portion: <span className="font-semibold text-zinc-200">{item.portionName}</span> (
                      {item.servingSizeGrams}
                      {item.portionName?.toLowerCase().includes('ml') || isLiquidFood(item.name) ? 'ml' : 'g'})
                    </p>

                    {/* Breakdown per ingredient if detailed meal */}
                    {item.breakdownItems && item.breakdownItems.length > 0 && (
                      <div className="mt-2 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs font-mono">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Composition analysée</span>
                        {item.breakdownItems.map((ing, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-400">
                            <span>• {ing.name} ({ing.portion})</span>
                            <span className="font-bold text-zinc-200">{ing.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Health Advice if present */}
                    {item.aiAdvice && (
                      <div className="mt-2 flex items-start space-x-1.5 text-xs text-lime-300 bg-lime-400/10 p-2.5 rounded-xl border border-lime-400/20">
                        <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                        <span>{item.aiAdvice}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Calorie Pill */}
                  <div className="text-right font-mono">
                    <span className="text-base font-black italic text-white">{item.calories}</span>
                    <span className="text-[10px] text-zinc-500 block uppercase">kcal</span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Supprimer cet aliment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Macro Pill Highlights */}
              <div className="flex items-center space-x-4 text-xs font-mono pt-1 border-t border-zinc-800 text-zinc-400">
                <span className="text-lime-400 font-bold">P: {item.protein}g</span>
                <span className="text-cyan-400 font-bold">G: {item.carbs}g</span>
                <span className="text-amber-400 font-bold">L: {item.fat}g</span>
                {item.fiber !== undefined && <span className="text-emerald-400 font-bold">Fib: {item.fiber}g</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
