import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES, Language } from '../data/languages';
import { Search, Globe, Check, X, Sparkles } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguageCode, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLanguages = LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || lang.region === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  const handleSelectLanguage = (lang: Language) => {
    setLanguageCode(lang.code);
    onClose();
  };

  const regions = [
    { id: 'all', label: t('all_regions', 'Toutes les régions') },
    { id: 'Europe', label: 'Europe (🇪🇺)' },
    { id: 'Asia & Pacific', label: 'Asie & Pacifique (🌏)' },
    { id: 'Middle East & Africa', label: 'Moyen-Orient & Afrique (🌍)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <span>{t('select_language', 'Langue de l’application')}</span>
                <span className="text-xs bg-lime-400 text-black px-2 py-0.5 rounded-full font-mono font-black">
                  {LANGUAGES.length} langues
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t('language_description', 'Sélectionnez parmi +30 langues. L’interface et l’IA Gemini s’adapteront.')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filters */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t('search_language', 'Rechercher une langue... (ex: English, 日本語, Español)')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedRegion === reg.id
                    ? 'bg-lime-400 text-black shadow-xs font-black'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-zinc-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-lime-400/10 border-lime-400 text-white ring-1 ring-lime-400/40 shadow-lg shadow-lime-400/10'
                      : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl shrink-0 leading-none">{lang.flag}</span>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-sm truncate">{lang.nativeName}</span>
                        {lang.rtl && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono font-bold">
                            RTL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate flex items-center space-x-2">
                        <span>{lang.name}</span>
                        <span>•</span>
                        <span className="font-mono uppercase font-bold text-zinc-500 text-[10px]">{lang.code}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-lime-400 text-black flex items-center justify-center shrink-0 font-bold shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-900 group-hover:bg-zinc-700 text-zinc-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <span className="text-xs font-mono font-bold">+</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-zinc-400">
              <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-bounce" />
              <p className="font-bold text-sm">Aucune langue trouvée pour "{searchTerm}"</p>
              <p className="text-xs text-zinc-500 mt-1">Essayez un autre mot-clé ou modifiez la région.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2 font-mono">
            <span>Actuellement :</span>
            <span className="text-lime-400 font-bold flex items-center space-x-1">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
