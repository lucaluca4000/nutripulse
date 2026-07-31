import React, { useState } from 'react';
import { AiNutritionAnalysisResponse, MealType } from '../../types';
import { UtensilsCrossed, Sparkles, RefreshCw, Check, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TextAnalyzerModalProps {
  onAddFoodLog: (item: {
    name: string;
    mealType: MealType;
    portionName: string;
    servingSizeGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    source: 'ai_text';
    nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
    aiAdvice?: string;
    breakdownItems?: any[];
  }) => void;
  defaultMealType?: MealType;
  onClose?: () => void;
}

export const TextAnalyzerModal: React.FC<TextAnalyzerModalProps> = ({
  onAddFoodLog,
  defaultMealType = 'lunch',
  onClose,
}) => {
  const { currentLanguage } = useLanguage();
  const [textInput, setTextInput] = useState('');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiNutritionAnalysisResponse | null>(null);

  const samplePrompts = [
    "200g de blanc de poulet grillé, 150g de riz basmati et brocolis à la vapeur",
    "2 œufs au plat sur 2 tranches de pain complet avec un demi-avocat et un espresso",
    "Un bol de Skyr 200g avec 30g de flocons d'avoine, des poignées de framboises et 15g de beurre de cacahuète",
    "Une portion de lasagnes à la viande hachée bio avec salade verte et vinaigrette",
  ];

  const handleAnalyze = async () => {
    if (!textInput.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/nutrition/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput,
          targetLanguage: currentLanguage.code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’analyse du repas par l’IA');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.error('Error analyzing text:', err);
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!analysisResult) return;

    onAddFoodLog({
      name: analysisResult.dishName,
      mealType,
      portionName: analysisResult.servingSize || '1 portion',
      servingSizeGrams: analysisResult.estimatedWeightGrams || 250,
      calories: Math.round(analysisResult.calories),
      protein: Math.round(analysisResult.protein),
      carbs: Math.round(analysisResult.carbs),
      fat: Math.round(analysisResult.fat),
      fiber: Math.round(analysisResult.fiber || 0),
      sugar: Math.round(analysisResult.sugar || 0),
      sodium: Math.round(analysisResult.sodiumMg || 0),
      source: 'ai_text',
      nutriScore: analysisResult.nutriScore,
      aiAdvice: analysisResult.healthAdvice,
      breakdownItems: analysisResult.itemsBreakdown,
    });

    if (onClose) onClose();
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl max-w-3xl mx-auto my-4 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 text-white p-6 sm:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-0.5">NLP REPAS IA</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">Décrire un Repas en Texte Libre</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Tapez simplement ce que vous avez mangé : l'IA décompose les ingrédients et calcule les valeurs nutritionnelles.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Input Text Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Description détaillée de votre repas
          </label>
          <textarea
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ex: J'ai mangé un pavé de saumon grillé (180g) avec du riz basmati (150g cuit) et des asperges rôties..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:ring-2 focus:ring-lime-400 font-mono text-white text-xs sm:text-sm focus:outline-none"
          />

          {/* Sample Prompts Chips */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Exemples d'exemples rapides :</span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTextInput(prompt)}
                  className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono border border-zinc-800 transition-colors text-left"
                >
                  "{prompt.slice(0, 36)}..."
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !textInput.trim()}
          className="w-full py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Calcul des valeurs nutritionnelles par l'IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyser avec l’IA Gemini</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ANALYSIS RESULT */}
        {analysisResult && (
          <div className="space-y-6 pt-4 border-t border-zinc-800">
            <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl border border-zinc-800 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 rounded-md bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-black font-mono">
                    NutriScore {analysisResult.nutriScore}
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white mt-2">{analysisResult.dishName}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{analysisResult.description}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black italic text-lime-400">{analysisResult.calories}</span>
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase">kcal total</span>
                </div>
              </div>

              {/* Main Macros Grid */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Protéines</span>
                  <span className="text-base font-black text-lime-400">{analysisResult.protein}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Glucides</span>
                  <span className="text-base font-black text-cyan-400">{analysisResult.carbs}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Lipides</span>
                  <span className="text-base font-black text-amber-400">{analysisResult.fat}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Fibres</span>
                  <span className="text-base font-black text-emerald-400">{analysisResult.fiber}g</span>
                </div>
              </div>

              {/* Breakdown */}
              {analysisResult.itemsBreakdown && analysisResult.itemsBreakdown.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">Détail des ingrédients</span>
                  <div className="space-y-1.5">
                    {analysisResult.itemsBreakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800/60">
                        <span className="font-medium text-white">{item.name} <span className="text-zinc-500 text-[11px] font-mono">({item.portion})</span></span>
                        <div className="flex items-center space-x-3 font-mono text-[11px]">
                          <span className="text-lime-400 font-bold">{item.protein}g P</span>
                          <span className="text-cyan-400 font-bold">{item.carbs}g G</span>
                          <span className="text-amber-400 font-bold">{item.fat}g L</span>
                          <span className="font-extrabold text-white">{item.calories} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              {analysisResult.healthAdvice && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                  <span>{analysisResult.healthAdvice}</span>
                </div>
              )}
            </div>

            {/* Target Meal Selector & Confirm Button */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Ajouter à quel repas ?</label>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setMealType('breakfast')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      mealType === 'breakfast' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Petit-Déj ☕
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('lunch')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      mealType === 'lunch' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Déjeuner 🥗
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('dinner')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      mealType === 'dinner' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Dîner 🍲
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('snack')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      mealType === 'snack' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    En-cas 🍏
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>Enregistrer dans mon Journal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
