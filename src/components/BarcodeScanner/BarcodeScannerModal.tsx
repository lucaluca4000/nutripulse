import React, { useState, useEffect, useRef } from 'react';
import { MealType } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanBarcode, Search, RefreshCw, Check, AlertCircle, Scale, Package, Info } from 'lucide-react';

interface BarcodeScannerModalProps {
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
    source: 'barcode';
    nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
    brand?: string;
    barcode?: string;
  }) => void;
  defaultMealType?: MealType;
  onClose?: () => void;
}

const POPULAR_BARCODES = [
  { code: '3017620422003', name: 'Nutella (Ferrero)', desc: 'Pâte à tartiner' },
  { code: '3228857000166', name: 'Skyr Danone Nature', desc: 'Spécialité laitière 0%' },
  { code: '3033710065967', name: 'Flocons d\'Avoine Bio', desc: 'Céréales complètes' },
  { code: '3155250004396', name: 'Poulet Fleury Michon', desc: 'Filet de poulet cuit' },
  { code: '3068320055008', name: 'Eau Minérale Evian', desc: 'Eau pure 1.5L' },
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onAddFoodLog,
  defaultMealType = 'lunch',
  onClose,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portion customization (grams)
  const [customPortionGrams, setCustomPortionGrams] = useState(100);

  // Fetched product state
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);

  // Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrContainerId = 'reader-qr-container';

  const startCameraScanner = async () => {
    setError(null);
    setIsCameraActive(true);

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrContainerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          (decodedText) => {
            // Successfully scanned barcode!
            html5QrCode.stop().then(() => {
              setIsCameraActive(false);
              fetchBarcodeData(decodedText);
            });
          },
          (_errorMessage) => {
            // ignore scan frame errors
          }
        );
      } catch (err: any) {
        console.error('Html5Qrcode start error:', err);
        setError('Impossible d’ouvrir l’appareil photo pour scanner le code-barres.');
        setIsCameraActive(false);
      }
    }, 200);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setIsCameraActive(false);
      }).catch(console.error);
    } else {
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Fetch product from API
  const fetchBarcodeData = async (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return;

    setLoading(true);
    setError(null);
    setScannedProduct(null);

    try {
      const res = await fetch(`/api/nutrition/barcode/${cleanCode}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Code-barres non trouvé dans OpenFoodFacts ou la base de données.');
      }

      setScannedProduct(data.product);
      setCustomPortionGrams(data.product.servingWeightGrams || 100);
    } catch (err: any) {
      console.error('Barcode fetch error:', err);
      setError(err.message || 'Erreur lors de la recherche du code-barres');
    } fontally: {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBarcodeData(manualCode);
  };

  // Calculated macros based on custom portion
  const ratio = (customPortionGrams || 100) / 100;
  const computedCalories = scannedProduct ? Math.round(scannedProduct.per100g.calories * ratio) : 0;
  const computedProtein = scannedProduct ? Math.round(scannedProduct.per100g.protein * ratio * 10) / 10 : 0;
  const computedCarbs = scannedProduct ? Math.round(scannedProduct.per100g.carbs * ratio * 10) / 10 : 0;
  const computedFat = scannedProduct ? Math.round(scannedProduct.per100g.fat * ratio * 10) / 10 : 0;
  const computedFiber = scannedProduct ? Math.round((scannedProduct.per100g.fiber || 0) * ratio * 10) / 10 : 0;

  const handleConfirmAdd = () => {
    if (!scannedProduct) return;

    onAddFoodLog({
      name: `${scannedProduct.name}${scannedProduct.brand ? ` (${scannedProduct.brand})` : ''}`,
      mealType,
      portionName: `${customPortionGrams}g`,
      servingSizeGrams: customPortionGrams,
      calories: computedCalories,
      protein: Math.round(computedProtein),
      carbs: Math.round(computedCarbs),
      fat: Math.round(computedFat),
      fiber: Math.round(computedFiber),
      sugar: Math.round((scannedProduct.per100g.sugar || 0) * ratio),
      sodium: Math.round((scannedProduct.per100g.sodiumMg || 0) * ratio),
      photoUrl: scannedProduct.imageUrl || undefined,
      source: 'barcode',
      nutriScore: scannedProduct.nutriScore,
      brand: scannedProduct.brand,
      barcode: scannedProduct.code,
    });

    if (onClose) onClose();
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl max-w-3xl mx-auto my-4 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 text-white p-6 sm:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0">
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-lime-400 font-bold block mb-0.5">OPENFOODFACTS EAN</span>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">Scanner de Code-barres</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Scannez le code EAN d'un produit avec la caméra ou saisissez-le manuellement.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        {/* Camera scanner view */}
        {isCameraActive ? (
          <div className="space-y-4">
            <div id={qrContainerId} className="w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 min-h-[250px]" />
            <div className="text-center">
              <button
                onClick={stopCameraScanner}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-xs hover:bg-zinc-800"
              >
                Fermer la caméra
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scan Trigger */}
              <button
                onClick={startCameraScanner}
                className="p-6 border-2 border-dashed border-lime-400/30 bg-lime-400/5 hover:bg-lime-400/10 hover:border-lime-400 rounded-2xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-lime-400 text-black flex items-center justify-center shadow-lg shadow-lime-400/20 group-hover:scale-110 transition-transform mb-2">
                  <ScanBarcode className="w-6 h-6" />
                </div>
                <span className="font-extrabold uppercase tracking-wider text-white text-sm">Ouvrir Scanner Caméra</span>
                <span className="text-xs text-zinc-400 mt-0.5">Viser le code-barres sur l'emballage</span>
              </button>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSearch} className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Ou tapez le code-barres (EAN)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Ex: 3017620422003"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-lime-400 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !manualCode.trim()}
                    className="p-2.5 bg-lime-400 hover:bg-lime-300 text-black rounded-xl font-black transition-colors disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Produits populaires prêts à tester :</span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_BARCODES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setManualCode(item.code);
                      fetchBarcodeData(item.code);
                    }}
                    className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono border border-zinc-800 transition-colors"
                  >
                    🏷️ {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-lime-400 mx-auto" />
            <p className="text-xs font-mono text-zinc-400">Interrogation d'OpenFoodFacts & de la base IA...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SCANNED PRODUCT CARD */}
        {scannedProduct && (
          <div className="space-y-6 pt-4 border-t border-zinc-800">
            <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl border border-zinc-800 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {scannedProduct.imageUrl ? (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-900 p-1 border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center text-lime-400 shrink-0 border border-zinc-800">
                      <Package className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 text-[10px] font-bold font-mono border border-zinc-800">
                        EAN {scannedProduct.code}
                      </span>
                      {scannedProduct.nutriScore && (
                        <span className="px-2 py-0.5 rounded-md bg-lime-400 text-black text-[10px] font-black uppercase">
                          NutriScore {scannedProduct.nutriScore}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mt-1">{scannedProduct.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">{scannedProduct.brand}</p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-3xl font-black italic text-lime-400">{computedCalories}</span>
                  <span className="text-[10px] text-zinc-500 block font-bold uppercase">kcal pour {customPortionGrams}g</span>
                </div>
              </div>

              {/* Portion Slider */}
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-zinc-300">Ajuster la portion consommée :</span>
                  <span className="font-black text-lime-400 text-sm">{customPortionGrams} g</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={customPortionGrams}
                  onChange={(e) => setCustomPortionGrams(parseInt(e.target.value) || 100)}
                  className="w-full accent-lime-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <button type="button" onClick={() => setCustomPortionGrams(30)} className="hover:text-lime-400">30g (Snack)</button>
                  <button type="button" onClick={() => setCustomPortionGrams(100)} className="hover:text-lime-400">100g (Standard)</button>
                  <button type="button" onClick={() => setCustomPortionGrams(150)} className="hover:text-lime-400">150g (Portion)</button>
                  <button type="button" onClick={() => setCustomPortionGrams(250)} className="hover:text-lime-400">250g (Grand)</button>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Protéines</span>
                  <span className="text-base font-black text-lime-400">{computedProtein}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Glucides</span>
                  <span className="text-base font-black text-cyan-400">{computedCarbs}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Lipides</span>
                  <span className="text-base font-black text-amber-400">{computedFat}g</span>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Fibres</span>
                  <span className="text-base font-black text-emerald-400">{computedFiber}g</span>
                </div>
              </div>
            </div>

            {/* Target Meal Selector & Add Button */}
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
