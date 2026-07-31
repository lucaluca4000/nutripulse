import React, { useState, useRef } from 'react';
import { AiNutritionAnalysisResponse, MealType } from '../../types';
import { Camera, Upload, Sparkles, RefreshCw, Check, AlertCircle, Info, Utensils, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PhotoAnalyzerModalProps {
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
    photoUrl?: string;
    source: 'ai_vision';
    nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
    aiAdvice?: string;
    breakdownItems?: any[];
  }) => void;
  defaultMealType?: MealType;
  onClose?: () => void;
}

export const PhotoAnalyzerModal: React.FC<PhotoAnalyzerModalProps> = ({
  onAddFoodLog,
  defaultMealType = 'lunch',
  onClose,
}) => {
  const { currentLanguage } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userHint, setUserHint] = useState('');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiNutritionAnalysisResponse | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Impossible d’accéder à l’appareil photo. Vous pouvez importer une image ci-dessous.');
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Take photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUri);
      stopCamera();
    }
  };

  // Handle file input upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Editable fields for precision refinement
  const [editedResult, setEditedResult] = useState<{
    dishName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    estimatedWeightGrams: number;
  } | null>(null);

  // Analyze image with Gemini
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setEditedResult(null);

    try {
      const res = await fetch('/api/nutrition/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          userHint: userHint.trim() || undefined,
          targetLanguage: currentLanguage.code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’analyse visuelle de l’image');
      }

      setAnalysisResult(data.data);
      setEditedResult({
        dishName: data.data.dishName,
        calories: Math.round(data.data.calories),
        protein: Math.round(data.data.protein),
        carbs: Math.round(data.data.carbs),
        fat: Math.round(data.data.fat),
        fiber: Math.round(data.data.fiber || 0),
        estimatedWeightGrams: Math.round(data.data.estimatedWeightGrams || 250),
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Une erreur est survenue lors de l’analyse IA.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and save to daily log
  const handleConfirmAdd = () => {
    if (!analysisResult) return;

    const finalDishName = editedResult?.dishName || analysisResult.dishName;
    const finalCalories = editedResult?.calories ?? Math.round(analysisResult.calories);
    const finalProtein = editedResult?.protein ?? Math.round(analysisResult.protein);
    const finalCarbs = editedResult?.carbs ?? Math.round(analysisResult.carbs);
    const finalFat = editedResult?.fat ?? Math.round(analysisResult.fat);
    const finalFiber = editedResult?.fiber ?? Math.round(analysisResult.fiber || 0);
    const finalWeight = editedResult?.estimatedWeightGrams ?? (analysisResult.estimatedWeightGrams || 250);

    onAddFoodLog({
      name: finalDishName,
      mealType,
      portionName: `${finalWeight}g`,
      servingSizeGrams: finalWeight,
      calories: finalCalories,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
      fiber: finalFiber,
      sugar: Math.round(analysisResult.sugar || 0),
      sodium: Math.round(analysisResult.sodiumMg || 0),
      photoUrl: selectedImage || undefined,
      source: 'ai_vision',
      nutriScore: analysisResult.nutriScore,
      aiAdvice: analysisResult.healthAdvice,
      breakdownItems: analysisResult.itemsBreakdown,
    });

    if (onClose) onClose();
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl max-w-3xl mx-auto my-4 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 text-white p-6 sm:p-8 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-0.5">VISION IA GEMINI</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">Analyseur de Repas par Photo</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Prenez en photo votre assiette : l'IA Gemini identifie les aliments et calcule les calories & macros.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Step 1: Camera or Upload */}
        {!selectedImage && !isCameraActive && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="p-6 sm:p-8 border-2 border-dashed border-lime-400/30 bg-lime-400/5 hover:bg-lime-400/10 hover:border-lime-400 rounded-2xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/20 group-hover:scale-110 transition-transform mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="font-extrabold uppercase tracking-wider text-white text-sm">Prendre une photo</span>
                <span className="text-xs text-zinc-400 mt-1">Utiliser l'appareil photo mobile</span>
              </button>

              <label className="p-6 sm:p-8 border-2 border-dashed border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3 border border-zinc-700">
                  <Upload className="w-7 h-7 text-lime-400" />
                </div>
                <span className="font-extrabold uppercase tracking-wider text-white text-sm">Importer une image</span>
                <span className="text-xs text-zinc-400 mt-1">Sélectionner une photo dans votre galerie</span>
              </label>
            </div>

            {/* Clickable Sample Food Image Gallery */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-lime-400 tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <span>Ou testez avec un exemple de photo :</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">1-Clic pour analyser</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setSelectedImage('/src/assets/images/healthy_meal_banner_1785427315364.jpg')}
                  className="group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-lime-400 rounded-xl overflow-hidden transition-all shadow-md"
                >
                  <div className="h-28 overflow-hidden relative">
                    <img
                      src="/src/assets/images/healthy_meal_banner_1785427315364.jpg"
                      alt="Assiette Saumon Quinoa"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-lime-400 font-bold">
                      Saumon & Quinoa
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] font-bold text-white flex justify-between items-center">
                    <span>Bol Équilibré</span>
                    <span className="text-zinc-400 text-[10px]">Tester ➔</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedImage('/src/assets/images/food_scan_demo_1785427329205.jpg')}
                  className="group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-lime-400 rounded-xl overflow-hidden transition-all shadow-md"
                >
                  <div className="h-28 overflow-hidden relative">
                    <img
                      src="/src/assets/images/food_scan_demo_1785427329205.jpg"
                      alt="Poké Bowl Thon"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-lime-400 font-bold">
                      Poké Bowl Thon
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] font-bold text-white flex justify-between items-center">
                    <span>Thon & Avocat</span>
                    <span className="text-zinc-400 text-[10px]">Tester ➔</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedImage('/src/assets/images/healthy_snack_photo_1785427353076.jpg')}
                  className="group cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-lime-400 rounded-xl overflow-hidden transition-all shadow-md"
                >
                  <div className="h-28 overflow-hidden relative">
                    <img
                      src="/src/assets/images/healthy_snack_photo_1785427353076.jpg"
                      alt="Smoothie Bowl Açaí"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-lime-400 font-bold">
                      Smoothie Açaí
                    </span>
                  </div>
                  <div className="p-2.5 text-[11px] font-bold text-white flex justify-between items-center">
                    <span>Fruits & Graines</span>
                    <span className="text-zinc-400 text-[10px]">Tester ➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Camera View */}
        {isCameraActive && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 aspect-video max-h-96 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={capturePhoto}
                className="px-6 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md shadow-lime-400/20 flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre la photo</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-xs hover:bg-zinc-800"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Selected Image Preview & Controls */}
        {selectedImage && !analysisResult && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 max-h-80 flex items-center justify-center">
              <img src={selectedImage} alt="Plat capturé" className="w-full h-full object-contain max-h-80" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 p-2 bg-zinc-950/80 hover:bg-zinc-900 text-white rounded-xl backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-zinc-800"
              >
                Changer de photo
              </button>
            </div>

            {/* Optional Hint Text */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Note facultative pour l'IA (ingrédients masqués, marque, etc.)
              </label>
              <input
                type="text"
                placeholder="Ex: Assiette de poulet avec 20g de sauce au poivre, demi-avocat..."
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:ring-2 focus:ring-lime-400 focus:outline-none"
              />
            </div>

            {/* Analyze Trigger Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Analyse par l’IA Gemini en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Lancer l’Estimation Nutritionnelle IA</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ANALYSIS RESULT DISPLAY */}
        {analysisResult && (
          <div className="space-y-6">
            <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl border border-zinc-800 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-lime-400/20 text-lime-400 border border-lime-400/30 text-xs font-black font-mono">
                      NutriScore {analysisResult.nutriScore}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Confiance: {analysisResult.confidenceScore}%</span>
                  </div>
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
                  <span className="text-base font-black text-lime-400">{editedResult?.protein ?? analysisResult.protein}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Glucides</span>
                  <span className="text-base font-black text-cyan-400">{editedResult?.carbs ?? analysisResult.carbs}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Lipides</span>
                  <span className="text-base font-black text-amber-400">{editedResult?.fat ?? analysisResult.fat}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Fibres</span>
                  <span className="text-base font-black text-emerald-400">{editedResult?.fiber ?? (analysisResult.fiber || 0)}g</span>
                </div>
              </div>

              {/* Adjust / Refine Precision Section */}
              {editedResult && (
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
                      Ajuster la précision (optionnel)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Modifiez le poids ou les valeurs si vous avez pesé votre plat</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase block font-bold mb-1">Poids (g)</label>
                      <input
                        type="number"
                        value={editedResult.estimatedWeightGrams}
                        onChange={(e) => setEditedResult({ ...editedResult, estimatedWeightGrams: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase block font-bold mb-1">Calories (kcal)</label>
                      <input
                        type="number"
                        value={editedResult.calories}
                        onChange={(e) => setEditedResult({ ...editedResult, calories: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-lime-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase block font-bold mb-1">Protéines (g)</label>
                      <input
                        type="number"
                        value={editedResult.protein}
                        onChange={(e) => setEditedResult({ ...editedResult, protein: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-lime-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase block font-bold mb-1">Glucides (g)</label>
                      <input
                        type="number"
                        value={editedResult.carbs}
                        onChange={(e) => setEditedResult({ ...editedResult, carbs: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-cyan-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-400 uppercase block font-bold mb-1">Lipides (g)</label>
                      <input
                        type="number"
                        value={editedResult.fat}
                        onChange={(e) => setEditedResult({ ...editedResult, fat: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-amber-300 font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients Breakdown */}
              {analysisResult.itemsBreakdown && analysisResult.itemsBreakdown.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">Composition estimée par ingrédient</span>
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

              {/* Health Advice */}
              {analysisResult.healthAdvice && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                  <span>{analysisResult.healthAdvice}</span>
                </div>
              )}
            </div>

            {/* Target Meal Selector & Confirm Button */}
            <div className="space-y-4 pt-2 border-t border-zinc-800">
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

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedImage(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-xs hover:bg-zinc-800 transition-colors"
                >
                  Autre plat
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold uppercase tracking-widest text-xs shadow-md shadow-lime-400/20 flex items-center justify-center space-x-2 transition-all"
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
