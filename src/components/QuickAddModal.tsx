import React, { useState } from 'react';
import { MealType } from '../types';
import { Search, Plus, Check, Utensils, Sparkles, X, Filter, Droplets, Scale } from 'lucide-react';
import { FOOD_DATABASE, FOOD_CATEGORIES, FoodItem, isLiquidFood } from '../data/foodDatabase';

interface QuickAddModalProps {
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
    source: 'preset' | 'manual';
    nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  }) => void;
  defaultMealType?: MealType;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  onAddFoodLog,
  defaultMealType = 'lunch',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'manual'>('preset');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [portionMode, setPortionMode] = useState<'quantity' | 'weight'>('quantity');
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [portionGrams, setPortionGrams] = useState(100);
  const [userUnitOverride, setUserUnitOverride] = useState<'g' | 'ml' | null>(null);

  // Manual Form state
  const [manualName, setManualName] = useState('');
  const [manualQuantity, setManualQuantity] = useState<number>(1);
  const [manualUnitWeight, setManualUnitWeight] = useState<number>(50);
  const [manualCal, setManualCal] = useState(150);
  const [manualP, setManualP] = useState(10);
  const [manualC, setManualC] = useState(15);
  const [manualF, setManualF] = useState(5);
  const [manualFib, setManualFib] = useState(2);

  // AI Estimate & Search state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Detect if current item/context is liquid
  const isLiquidDetected =
    selectedCategory === 'Boissons & Protéines' ||
    isLiquidFood(manualName) ||
    isLiquidFood(searchTerm);

  const effectiveUnit = userUnitOverride ?? (isLiquidDetected ? 'ml' : 'g');

  const filteredPresets = FOOD_DATABASE.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // DB match suggestion for manual input
  const suggestedDbItem = manualName.trim().length >= 2
    ? FOOD_DATABASE.find(f => f.name.toLowerCase().includes(manualName.toLowerCase()))
    : null;

  const applyDbItem = (food: FoodItem) => {
    const ratio = portionGrams / 100;
    setManualName(food.name);
    setManualCal(Math.round(food.calories100g * ratio));
    setManualP(Math.round(food.p100g * ratio * 10) / 10);
    setManualC(Math.round(food.c100g * ratio * 10) / 10);
    setManualF(Math.round(food.f100g * ratio * 10) / 10);
    setManualFib(Math.round(food.fib100g * ratio * 10) / 10);
    if (food.unit === 'ml' || isLiquidFood(food.name, food.category)) {
      setUserUnitOverride('ml');
    }
    setAiSuccessMsg(`Données pré-remplies depuis la base (${food.name}) !`);
    setTimeout(() => setAiSuccessMsg(null), 3000);
  };

  // AI Estimate handler
  const handleAiEstimate = async (queryToUse?: string) => {
    const textToAnalyze = queryToUse || manualName || searchTerm;
    if (!textToAnalyze.trim()) {
      setAiError('Veuillez spécifier le nom d\'un aliment.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuccessMsg(null);

    try {
      const fullQuery = `${portionGrams}${effectiveUnit} de ${textToAnalyze}`;
      const res = await fetch('/api/nutrition/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullQuery }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du calcul par l’IA.');
      }

      const result = data.data;
      setManualName(result.dishName || textToAnalyze);
      setManualCal(Math.round(result.calories || 0));
      setManualP(Math.round((result.protein || 0) * 10) / 10);
      setManualC(Math.round((result.carbs || 0) * 10) / 10);
      setManualF(Math.round((result.fat || 0) * 10) / 10);
      setManualFib(Math.round((result.fiber || 0) * 10) / 10);
      if (result.estimatedWeightGrams) {
        setPortionGrams(Math.round(result.estimatedWeightGrams));
      }
      if (isLiquidFood(result.dishName || textToAnalyze)) {
        setUserUnitOverride('ml');
      }
      setActiveTab('manual');
      setAiSuccessMsg(`✨ Informations nutritionnelles calculées par l'IA Gemini pour "${result.dishName || textToAnalyze}" !`);
      setTimeout(() => setAiSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('AI estimate error:', err);
      setAiError(err.message || 'Impossible d\'estimer automatiquement cet aliment.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddPreset = (food: FoodItem, explicitQty?: number) => {
    const qty = explicitQty !== undefined ? explicitQty : (portionMode === 'quantity' ? quantityCount : 1);
    const calculatedGrams = explicitQty !== undefined || portionMode === 'quantity'
      ? Math.round(qty * food.defaultServingGrams)
      : portionGrams;

    const ratio = calculatedGrams / 100;
    const isLiquid = food.unit === 'ml' || isLiquidFood(food.name, food.category) || (userUnitOverride === 'ml');
    const unitStr = isLiquid ? 'ml' : 'g';

    const portionLabel = explicitQty !== undefined || portionMode === 'quantity'
      ? (qty === 1 ? `${food.servingUnitName} (${calculatedGrams}${unitStr})` : `${qty} × ${food.servingUnitName} (${calculatedGrams}${unitStr})`)
      : `${calculatedGrams}${unitStr} (${food.servingUnitName})`;

    onAddFoodLog({
      name: food.name,
      mealType,
      portionName: portionLabel,
      servingSizeGrams: calculatedGrams,
      calories: Math.round(food.calories100g * ratio),
      protein: Math.round(food.p100g * ratio * 10) / 10,
      carbs: Math.round(food.c100g * ratio * 10) / 10,
      fat: Math.round(food.f100g * ratio * 10) / 10,
      fiber: Math.round(food.fib100g * ratio * 10) / 10,
      source: 'preset',
      nutriScore: food.nutriScore,
    });
    onClose();
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const totalWeight = portionMode === 'quantity'
      ? Math.round(manualQuantity * manualUnitWeight)
      : portionGrams;

    const isLiquid = isLiquidFood(manualName) || effectiveUnit === 'ml';
    const unitStr = isLiquid ? 'ml' : 'g';

    const portionLabel = portionMode === 'quantity'
      ? `${manualQuantity} portion${manualQuantity > 1 ? 's' : ''} (${totalWeight}${unitStr})`
      : `${totalWeight}${unitStr}`;

    onAddFoodLog({
      name: manualName,
      mealType,
      portionName: portionLabel,
      servingSizeGrams: totalWeight,
      calories: Math.round(manualCal),
      protein: Math.round(manualP),
      carbs: Math.round(manualC),
      fat: Math.round(manualF),
      fiber: Math.round(manualFib),
      source: 'manual',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-lime-400" />
            <h3 className="font-black uppercase italic tracking-tight text-base">Ajouter un Aliment au Journal</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Target Selector */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Choisir le repas</label>
          <div className="grid grid-cols-4 gap-2 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setMealType('breakfast')}
              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                mealType === 'breakfast' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Petit-Déj ☕
            </button>
            <button
              type="button"
              onClick={() => setMealType('lunch')}
              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                mealType === 'lunch' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Déjeuner 🥗
            </button>
            <button
              type="button"
              onClick={() => setMealType('dinner')}
              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                mealType === 'dinner' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Dîner 🍲
            </button>
            <button
              type="button"
              onClick={() => setMealType('snack')}
              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                mealType === 'snack' ? 'bg-lime-400/20 border-lime-400 text-lime-400 font-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              En-cas 🍏
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-zinc-800 text-xs font-black uppercase tracking-wider bg-zinc-950">
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'preset' ? 'border-b-2 border-lime-400 text-lime-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Bibliothèque d'Aliments Courants
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'manual' ? 'border-b-2 border-lime-400 text-lime-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Saisie Manuelle Personnalisée
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'preset' ? (
            <div className="space-y-4">
              {/* Search Bar & Category Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder={`Rechercher parmi ${FOOD_DATABASE.length} aliments (ex: Poulet, Riz, Skyr, Pizza, Saumon...)...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant AI Calculation Button for Search Term */}
                {searchTerm.trim().length >= 2 && (
                  <div className="p-3 bg-lime-400/10 border border-lime-400/30 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-lime-400">
                      <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>Aliment personnalisé ? Calculer <strong>"{searchTerm}"</strong> par l'IA</span>
                    </div>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleAiEstimate(searchTerm)}
                      className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-extrabold rounded-lg text-xs transition-colors flex items-center space-x-1 uppercase tracking-wider shadow-sm"
                    >
                      {aiLoading ? (
                        <span>Calcul en cours...</span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Estimer avec l'IA</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Category Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
                  {FOOD_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-lime-400 text-black font-black shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Mode & Quantity Controls */}
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-zinc-300 uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-lime-400" />
                    <span>Calculer par :</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px] font-black">
                    <button
                      type="button"
                      onClick={() => setPortionMode('quantity')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        portionMode === 'quantity'
                          ? 'bg-lime-400 text-black shadow-xs font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      🥚 Nombre d'unités (ex: 3 œufs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortionMode('weight')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        portionMode === 'weight'
                          ? 'bg-lime-400 text-black shadow-xs font-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ⚖️ Poids exact ({effectiveUnit})
                    </button>
                  </div>
                </div>

                {portionMode === 'quantity' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quantité :</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantityCount(q)}
                            className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs transition-all ${
                              quantityCount === q
                                ? 'bg-lime-400 text-black shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            {q}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setQuantityCount(Math.max(0.5, quantityCount - 1))}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <div className="flex items-center space-x-1 px-1">
                        <input
                          type="number"
                          min="0.25"
                          step="0.5"
                          max="50"
                          value={quantityCount}
                          onChange={(e) => setQuantityCount(parseFloat(e.target.value) || 1)}
                          className="w-10 text-center bg-transparent font-mono font-black text-lime-400 text-sm focus:outline-none"
                        />
                        <span className="text-[11px] text-zinc-400 font-bold">unités</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuantityCount(quantityCount + 1)}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">Unité :</span>
                      <div className="flex items-center space-x-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setUserUnitOverride('g')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all ${
                            effectiveUnit === 'g' ? 'bg-lime-400 text-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          g (Grammes)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserUnitOverride('ml')}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all flex items-center space-x-0.5 ${
                            effectiveUnit === 'ml' ? 'bg-cyan-400 text-black' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Droplets className="w-2.5 h-2.5 inline" />
                          <span>ml (Liquides)</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={portionGrams}
                        onChange={(e) => setPortionGrams(parseInt(e.target.value) || 100)}
                        className="accent-lime-400"
                      />
                      <span className="font-extrabold text-lime-400 font-mono text-sm w-14 text-right">
                        {portionGrams}{effectiveUnit}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preset Items List */}
              <div className="divide-y divide-zinc-800 border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                {filteredPresets.length > 0 ? (
                  filteredPresets.map((food, idx) => {
                    const isLiquid = food.unit === 'ml' || isLiquidFood(food.name, food.category) || (userUnitOverride === 'ml');
                    const itemUnit = isLiquid ? 'ml' : 'g';

                    const calculatedWeight = portionMode === 'quantity'
                      ? Math.round(quantityCount * food.defaultServingGrams)
                      : portionGrams;

                    const ratio = calculatedWeight / 100;
                    const cal = Math.round(food.calories100g * ratio);
                    const p = Math.round(food.p100g * ratio * 10) / 10;
                    const c = Math.round(food.c100g * ratio * 10) / 10;
                    const f = Math.round(food.f100g * ratio * 10) / 10;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 hover:bg-zinc-800/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex-1 min-w-0" onClick={() => handleAddPreset(food)}>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-black text-sm text-white group-hover:text-lime-400 transition-colors cursor-pointer">{food.name}</span>
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-bold uppercase">{food.category}</span>
                            {itemUnit === 'ml' && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1 py-0.2 font-black rounded flex items-center space-x-0.5">
                                <Droplets className="w-2.5 h-2.5" />
                                <span>Liquide</span>
                              </span>
                            )}
                            <span className={`text-[9px] px-1 py-0.2 font-black rounded ${
                              food.nutriScore === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              food.nutriScore === 'B' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' :
                              food.nutriScore === 'C' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>Nutri-Score {food.nutriScore}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 font-mono">
                            <strong className="text-zinc-200 font-bold">
                              {portionMode === 'quantity'
                                ? `${quantityCount > 1 ? `${quantityCount} × ` : ''}${food.servingUnitName} (${calculatedWeight}${itemUnit})`
                                : `${calculatedWeight}${itemUnit}`}
                            </strong>
                            {' : '}
                            <strong className="text-lime-400">{p}g Prot</strong> • <strong className="text-cyan-400">{c}g Glu</strong> • <strong className="text-amber-400">{f}g Lip</strong>
                          </p>
                        </div>

                        {/* Quantity Quick Selector & Add Button */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                          {portionMode === 'quantity' && (
                            <div className="hidden md:flex items-center space-x-1 text-[10px] font-mono font-bold">
                              {[1, 2, 3, 4].map((q) => (
                                <button
                                  key={q}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddPreset(food, q);
                                  }}
                                  title={`Ajouter ${q} × ${food.servingUnitName}`}
                                  className="px-1.5 py-1 bg-zinc-900 hover:bg-lime-400 hover:text-black border border-zinc-800 rounded text-zinc-300 font-black transition-all"
                                >
                                  +{q}
                                </button>
                              ))}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddPreset(food)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl text-xs transition-colors shadow-md"
                          >
                            <span className="font-mono font-black">{cal} kcal</span>
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <p className="text-sm text-zinc-400 font-medium">Aucun aliment correspondant dans cette catégorie.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('manual');
                        setManualName(searchTerm);
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-lime-400 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter "{searchTerm}" en saisie manuelle</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddManual} className="space-y-4">
              {/* Feedback messages */}
              {aiSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{aiSuccessMsg}</span>
                </div>
              )}
              {aiError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center justify-between">
                  <span>{aiError}</span>
                  <button type="button" onClick={() => setAiError(null)} className="text-zinc-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">Nom de l'aliment</label>
                  <button
                    type="button"
                    disabled={aiLoading || !manualName.trim()}
                    onClick={() => handleAiEstimate()}
                    className="text-[11px] font-black text-lime-400 hover:text-lime-300 disabled:opacity-40 flex items-center space-x-1 uppercase tracking-wider bg-lime-400/10 hover:bg-lime-400/20 px-2.5 py-1 rounded-lg border border-lime-400/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Recherche IA...' : 'Chercher les calories avec l\'IA'}</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Brownie chocolat, Omelette au fromage, Jus d'orange..."
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full pr-28 pl-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={aiLoading || !manualName.trim()}
                    onClick={() => handleAiEstimate()}
                    className="absolute right-1.5 px-3 py-1.5 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-extrabold rounded-lg text-xs transition-colors flex items-center space-x-1 uppercase tracking-wider shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>IA</span>
                  </button>
                </div>

                {/* Database Auto-Match Suggestion Chip */}
                {suggestedDbItem && (
                  <div className="mt-2 p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs flex items-center justify-between">
                    <span className="truncate">
                      💡 Trouvez dans la base : <strong>{suggestedDbItem.name}</strong> ({suggestedDbItem.calories100g} kcal/100{suggestedDbItem.unit || 'g'})
                    </span>
                    <button
                      type="button"
                      onClick={() => applyDbItem(suggestedDbItem)}
                      className="ml-2 px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold rounded-lg text-[10px] uppercase tracking-wider shrink-0 transition-colors"
                    >
                      Remplir
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {portionMode === 'quantity' ? (
                  <div className="space-y-1">
                    <label className="block font-bold text-zinc-400 uppercase">Quantité (Nbr d'unités)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0.25"
                        step="0.5"
                        value={manualQuantity}
                        onChange={(e) => {
                          const qty = parseFloat(e.target.value) || 1;
                          setManualQuantity(qty);
                          setPortionGrams(Math.round(qty * manualUnitWeight));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-lime-400 font-black text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                      />
                      <span className="text-zinc-500 font-bold shrink-0 text-[11px]">x {manualUnitWeight}{effectiveUnit}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-zinc-400 uppercase">Portion ({effectiveUnit})</label>
                      <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 rounded border border-zinc-800 text-[9px]">
                        <button
                          type="button"
                          onClick={() => setUserUnitOverride('g')}
                          className={`px-1.5 py-0.5 rounded font-black ${effectiveUnit === 'g' ? 'bg-lime-400 text-black' : 'text-zinc-400'}`}
                        >
                          g
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserUnitOverride('ml')}
                          className={`px-1.5 py-0.5 rounded font-black ${effectiveUnit === 'ml' ? 'bg-cyan-400 text-black' : 'text-zinc-400'}`}
                        >
                          ml
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={portionGrams}
                      onChange={(e) => setPortionGrams(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase">Calories Totales (kcal)</label>
                  <input
                    type="number"
                    value={manualCal}
                    onChange={(e) => setManualCal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-lime-400 font-black text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase">Protéines (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualP}
                    onChange={(e) => setManualP(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-lime-400 font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase">Glucides (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualC}
                    onChange={(e) => setManualC(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-cyan-400 font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase">Lipides (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualF}
                    onChange={(e) => setManualF(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase">Fibres (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFib}
                    onChange={(e) => setManualFib(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter cet aliment au journal</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
