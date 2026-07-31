import React from 'react';
import {
  Camera,
  UtensilsCrossed,
  ScanBarcode,
  PlusCircle,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MealType } from '../types';

interface MobileQuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action: 'photo' | 'text' | 'barcode' | 'quick_add',
    mealType?: MealType
  ) => void;
}

export const MobileQuickActionSheet: React.FC<MobileQuickActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in md:hidden font-sans">
      {/* Backdrop overlay touch to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 pb-8 shadow-2xl z-10 animate-slide-up">
        {/* Handlebar */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-white text-base uppercase tracking-wider">
                Ajouter un repas
              </h3>
              <p className="text-[11px] text-zinc-400">
                Choisissez votre méthode de saisie préférée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Option 1: Photo Scan */}
          <button
            onClick={() => {
              onSelectAction('photo');
              onClose();
            }}
            className="p-4 bg-gradient-to-br from-lime-500/10 via-zinc-950 to-zinc-950 border border-lime-400/40 hover:border-lime-400 rounded-2xl flex flex-col items-center text-center space-y-2 group transition-all active:scale-95 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-lime-400 text-black flex items-center justify-center font-bold shadow-lg shadow-lime-400/20 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black text-white block uppercase tracking-wider">
                Scan Photo IA
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Photo de votre assiette
              </span>
            </div>
          </button>

          {/* Option 2: Text Description */}
          <button
            onClick={() => {
              onSelectAction('text');
              onClose();
            }}
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center text-center space-y-2 group transition-all active:scale-95 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 text-lime-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-white block uppercase tracking-wider">
                Décrire Repas
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Texte libre ou vocal
              </span>
            </div>
          </button>

          {/* Option 3: Barcode */}
          <button
            onClick={() => {
              onSelectAction('barcode');
              onClose();
            }}
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center text-center space-y-2 group transition-all active:scale-95 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 text-cyan-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-white block uppercase tracking-wider">
                Code-barres
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Scanner un emballage
              </span>
            </div>
          </button>

          {/* Option 4: Quick Manual Add */}
          <button
            onClick={() => {
              onSelectAction('quick_add', 'lunch');
              onClose();
            }}
            className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex flex-col items-center text-center space-y-2 group transition-all active:scale-95 shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-white block uppercase tracking-wider">
                Ajout Manuel
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Saisie direct calories
              </span>
            </div>
          </button>
        </div>

        {/* Footer Hint */}
        <div className="text-center pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] text-zinc-500 font-mono">
            Powered by Gemini 3.6 Flash • Précision Scientifique IA
          </p>
        </div>
      </div>
    </div>
  );
};
