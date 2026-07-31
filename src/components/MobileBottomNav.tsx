import React from 'react';
import { Flame, Sparkles, LineChart, User, Plus } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'dashboard' | 'photo' | 'text' | 'barcode' | 'profile' | 'history' | 'recommendations';
  setCurrentTab: (tab: 'dashboard' | 'photo' | 'text' | 'barcode' | 'profile' | 'history' | 'recommendations') => void;
  onOpenActionHub: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenActionHub,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-2xl px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
            currentTab === 'dashboard' ? 'text-lime-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${currentTab === 'dashboard' ? 'bg-lime-400/10' : ''}`}>
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Accueil</span>
        </button>

        {/* Tab 2: Recommendations IA */}
        <button
          onClick={() => setCurrentTab('recommendations')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
            currentTab === 'recommendations' ? 'text-lime-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${currentTab === 'recommendations' ? 'bg-lime-400/10' : ''}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">IA Conseils</span>
        </button>

        {/* Central Floating Quick Add Action Hub */}
        <button
          onClick={onOpenActionHub}
          className="flex flex-col items-center justify-center -mt-6 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/30 ring-4 ring-zinc-950 transform active:scale-90 group-hover:bg-lime-300 transition-all p-3">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] uppercase font-black text-lime-400 tracking-widest mt-1">Ajouter</span>
        </button>

        {/* Tab 3: History & Progress */}
        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
            currentTab === 'history' ? 'text-lime-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${currentTab === 'history' ? 'bg-lime-400/10' : ''}`}>
            <LineChart className="w-5 h-5" />
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Progrès</span>
        </button>

        {/* Tab 4: Profile / Calculator */}
        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 ${
            currentTab === 'profile' ? 'text-lime-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${currentTab === 'profile' ? 'bg-lime-400/10' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Profil</span>
        </button>
      </div>
    </nav>
  );
};


