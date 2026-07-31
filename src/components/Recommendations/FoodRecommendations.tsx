import React, { useState, useEffect } from 'react';
import { Sparkles, Utensils, Clock, Check, RefreshCw, Flame, ChevronRight, Filter, AlertCircle, ChefHat } from 'lucide-react';
import { FoodRecommendation, MealType, UserProfile, FoodItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FoodRecommendationsProps {
  profile: UserProfile;
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  onAddMealItem: (item: Omit<FoodItem, 'id' | 'timestamp'>) => void;
  selectedDate: string;
}

export const FoodRecommendations: React.FC<FoodRecommendationsProps> = ({
  profile,
  remainingCalories,
  remainingProtein,
  remainingCarbs,
  remainingFat,
  onAddMealItem,
  selectedDate,
}) => {
  const { currentLanguage } = useLanguage();
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'any'>('any');
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'high_protein' | 'low_carb' | 'vegetarian' | 'quick_prep' | 'budget'>('all');
  const [customHint, setCustomHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nutrition/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: mealTypeFilter,
          remainingCalories: Math.max(100, remainingCalories),
          remainingProtein: Math.max(10, remainingProtein),
          remainingCarbs: Math.max(10, remainingCarbs),
          remainingFat: Math.max(5, remainingFat),
          goal: profile.goal,
          dietaryPreference,
          customHint,
          targetLanguage: currentLanguage.code,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Impossible d’obtenir les recommandations IA');
      }

      setRecommendations(data.data || []);
    } catch (err: any) {
      console.error('Recommendations error:', err);
      setError(err.message || 'Erreur lors du chargement des conseils repas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAddMeal = (rec: FoodRecommendation) => {
    const targetMeal: MealType = rec.mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(rec.mealType)
      ? rec.mealType
      : mealTypeFilter !== 'any'
      ? mealTypeFilter
      : 'snack';

    onAddMealItem({
      name: rec.title,
      mealType: targetMeal,
      date: selectedDate,
      portionName: `1 portion (${rec.prepTimeMinutes} min prép)`,
      servingSizeGrams: 250,
      calories: rec.calories,
      protein: rec.protein,
      carbs: rec.carbs,
      fat: rec.fat,
      fiber: rec.fiber,
      source: 'ai_text',
      nutriScore: rec.nutriScore || 'A',
      aiAdvice: rec.whyItFits,
      breakdownItems: rec.ingredients,
    });

    setAddedIds((prev) => new Set(prev).add(rec.id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto my-4 font-sans text-zinc-100">
      {/* Top Banner Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-lime-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold">IA GOURMANDE & SUR-MESURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-lime-400 inline shrink-0" />
              <span>Recommandations Repas</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              L'IA calcule vos macronutriments restants et vous propose des repas équilibrés et personnalisés pour combler exactement votre solde du jour.
            </p>
          </div>

          {/* Remaining Macros Stats Box */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="px-2">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Calories rest.</span>
              <span className="text-lg font-black italic text-lime-400">{Math.max(0, Math.round(remainingCalories))} <span className="text-[10px] font-normal text-zinc-500">kcal</span></span>
            </div>
            <div className="px-2 border-l border-zinc-800">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Protéines rest.</span>
              <span className="text-lg font-black italic text-white">{Math.max(0, Math.round(remainingProtein))} <span className="text-[10px] text-zinc-500 font-normal">g</span></span>
            </div>
            <div className="px-2 border-l border-zinc-800">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Glucides rest.</span>
              <span className="text-lg font-black italic text-cyan-400">{Math.max(0, Math.round(remainingCarbs))} <span className="text-[10px] text-zinc-500 font-normal">g</span></span>
            </div>
            <div className="px-2 border-l border-zinc-800">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Lipides rest.</span>
              <span className="text-lg font-black italic text-amber-400">{Math.max(0, Math.round(remainingFat))} <span className="text-[10px] text-zinc-500 font-normal">g</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Filter className="w-4 h-4 text-lime-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Personnaliser vos besoins</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meal Type selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2">Moment du repas</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold uppercase tracking-wider font-mono">
              <button
                onClick={() => setMealTypeFilter('any')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  mealTypeFilter === 'any' ? 'bg-lime-400 text-black border-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                💡 Tout
              </button>
              <button
                onClick={() => setMealTypeFilter('breakfast')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  mealTypeFilter === 'breakfast' ? 'bg-lime-400 text-black border-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                ☕ Petit-Déj
              </button>
              <button
                onClick={() => setMealTypeFilter('lunch')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  mealTypeFilter === 'lunch' ? 'bg-lime-400 text-black border-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                🥗 Déjeuner
              </button>
              <button
                onClick={() => setMealTypeFilter('dinner')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  mealTypeFilter === 'dinner' ? 'bg-lime-400 text-black border-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                🍲 Dîner
              </button>
            </div>
          </div>

          {/* Diet style */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2">Style diététique</label>
            <select
              value={dietaryPreference}
              onChange={(e: any) => setDietaryPreference(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:ring-2 focus:ring-lime-400 focus:outline-none"
            >
              <option value="all">Équilibré (Standard)</option>
              <option value="high_protein">⚡ Très Riche en Protéines</option>
              <option value="low_carb">🥑 Pauvre en Glucides (Low-Carb)</option>
              <option value="vegetarian">🌿 Végétarien</option>
              <option value="quick_prep">⏱️ Express (&lt; 15 min)</option>
              <option value="budget">💰 Économique / Simple</option>
            </select>
          </div>

          {/* Custom Hint */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2">Envies ou ingrédients au frigo</label>
            <input
              type="text"
              value={customHint}
              onChange={(e) => setCustomHint(e.target.value)}
              placeholder="Ex: J'ai des œufs, du fromage blanc, du saumon..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:ring-2 focus:ring-lime-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Calcul des suggestions IA par Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Générer de nouvelles idées personnalisées</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => {
          const isAdded = addedIds.has(rec.id);
          const sampleImages = [
            '/src/assets/images/healthy_meal_banner_1785427315364.jpg',
            '/src/assets/images/food_scan_demo_1785427329205.jpg',
            '/src/assets/images/healthy_snack_photo_1785427353076.jpg',
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
          ];
          const cardImage = sampleImages[idx % sampleImages.length];

          return (
            <div
              key={rec.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              {/* Card Image Banner */}
              <div className="h-40 overflow-hidden relative bg-zinc-950">
                <img
                  src={cardImage}
                  alt={rec.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-lime-400 border border-lime-400/30 text-[10px] font-black uppercase font-mono tracking-wider shadow-lg">
                    NutriScore {rec.nutriScore || 'A'}
                  </span>
                  <div className="flex items-center space-x-1.5 text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono border border-zinc-800 shadow-lg">
                    <Clock className="w-3.5 h-3.5 text-lime-400" />
                    <span>{rec.prepTimeMinutes} min</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Title & Description */}
                  <div>
                    <h4 className="text-lg font-black uppercase italic tracking-tight text-white group-hover:text-lime-400 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{rec.description}</p>
                  </div>

                  {/* Why it fits rationale */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 font-sans space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-400 block">💡 Pourquoi ce choix ?</span>
                    <p className="text-zinc-400 leading-snug">{rec.whyItFits}</p>
                  </div>

                  {/* Macro summary */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
                    <div>
                      <span className="text-zinc-500 text-[9px] block uppercase font-bold">Kcal</span>
                      <span className="font-black text-lime-400">{rec.calories}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block uppercase font-bold">Prot</span>
                      <span className="font-bold text-white">{rec.protein}g</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block uppercase font-bold">Gluc</span>
                      <span className="font-bold text-cyan-400">{rec.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] block uppercase font-bold">Lip</span>
                      <span className="font-bold text-amber-400">{rec.fat}g</span>
                    </div>
                  </div>

                  {/* Ingredients list */}
                  {rec.ingredients && rec.ingredients.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Ingrédients :</span>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {rec.ingredients.map((ing, i) => (
                          <li key={i} className="flex justify-between items-center text-[11px] border-b border-zinc-800/40 pb-1">
                            <span className="text-zinc-300 font-medium">{ing.name}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{ing.portion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* One Click Add Button */}
                <button
                  onClick={() => handleAddMeal(rec)}
                  disabled={isAdded}
                  className={`w-full py-3 rounded-xl font-extrabold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all shadow-md mt-4 ${
                    isAdded
                      ? 'bg-zinc-800 text-lime-400 border border-lime-400/30 cursor-default'
                      : 'bg-lime-400 hover:bg-lime-300 text-black shadow-lime-400/10'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Ajouté au Journal !</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-4 h-4" />
                      <span>Ajouter à mon Journal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
