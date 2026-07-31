import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LANGUAGES, getLanguageByCode } from '../data/languages';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguageCode: (code: string) => void;
  t: (key: string, defaultText?: string) => string;
  languages: Language[];
  isRTL: boolean;
}

const STORAGE_KEY = 'nutripulse_user_language';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  fr: {
    app_tagline: 'PRECISION NUTRITION',
    dashboard: 'Tableau de bord',
    ai_recipes: 'Conseils & Recettes IA',
    scan_photo: 'Scan Photo IA',
    describe_meal: 'Décrire un repas',
    barcode: 'Code-barres',
    history: 'Historique & Progrès',
    profile: 'Calculateur Besoins',
    quick_add: 'Ajouter Aliment',
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    snack: 'Collation',
    calories: 'Calories',
    protein: 'Protéines',
    carbs: 'Glucides',
    fat: 'Lipides',
    water: 'Hydratation',
    target: 'Objectif',
    remaining: 'Restant',
    over: 'Dépassement',
    select_language: 'Langue de l’application',
    language_description: 'Sélectionnez parmi 30+ langues disponibles. L’interface et l’IA Gemini généreront les réponses dans la langue choisie.',
    search_language: 'Rechercher une langue...',
    all_regions: 'Toutes les régions',
    save: 'Enregistrer',
    cancel: 'Annuler',
    create_account: 'Créer Compte',
    login: 'Se Connecter',
    logout: 'Se Déconnecter',
    language: 'Langue',
    today: 'Aujourd’hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    download_app: "Télécharger L'Application Native PWA",
    install_now: "Installer l'Application",
    install_pwa_title: "Installer NutriPulse sur votre appareil",
    install_pwa_desc: "Profitez d'une expérience application native complète : mode plein écran, notifications et synchronisation en direct.",
    installed_status: "L'application est installée et prête !",
    sync_guarantee: "Même compte & Synchronisation automatique 100%",
  },
  en: {
    app_tagline: 'PRECISION NUTRITION',
    dashboard: 'Dashboard',
    ai_recipes: 'AI Recipes & Tips',
    scan_photo: 'AI Photo Scan',
    describe_meal: 'Describe a meal',
    barcode: 'Barcode Scan',
    history: 'History & Progress',
    profile: 'Profile & Targets',
    quick_add: 'Add Food',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    water: 'Water Intake',
    target: 'Target',
    remaining: 'Remaining',
    over: 'Excess',
    select_language: 'App Language',
    language_description: 'Choose from 30+ supported languages. UI & Gemini AI analyses will adapt to your selected language.',
    search_language: 'Search language...',
    all_regions: 'All regions',
    save: 'Save',
    cancel: 'Cancel',
    create_account: 'Create Account',
    login: 'Log In',
    logout: 'Log Out',
    language: 'Language',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    download_app: 'Download Native PWA App',
    install_now: 'Install App Now',
    install_pwa_title: 'Install NutriPulse on your device',
    install_pwa_desc: 'Enjoy a full native app experience: fullscreen mode, home screen launcher, and live data sync.',
    installed_status: 'App is installed and standalone ready!',
    sync_guarantee: 'Same account & 100% Live Cloud Sync',
  },
  es: {
    app_tagline: 'NUTRICIÓN DE PRECISIÓN',
    dashboard: 'Panel principal',
    ai_recipes: 'Recetas e IA',
    scan_photo: 'Escanear Foto IA',
    describe_meal: 'Describir comida',
    barcode: 'Código de barras',
    history: 'Historial y Progreso',
    profile: 'Calculadora y Perfil',
    quick_add: 'Añadir alimento',
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Merienda',
    calories: 'Calorías',
    protein: 'Proteínas',
    carbs: 'Carbohidratos',
    fat: 'Grasas',
    water: 'Hidratación',
    target: 'Objetivo',
    remaining: 'Restante',
    over: 'Exceso',
    select_language: 'Idioma de la aplicación',
    language_description: 'Elige entre más de 30 idiomas. La IA Gemini responderá en el idioma seleccionado.',
    search_language: 'Buscar idioma...',
    all_regions: 'Todas las regiones',
    save: 'Guardar',
    cancel: 'Cancelar',
    create_account: 'Crear cuenta',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    language: 'Idioma',
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    download_app: 'Descargar Aplicación PWA',
    install_now: 'Instalar Aplicación',
    install_pwa_title: 'Instalar NutriPulse en tu dispositivo',
    install_pwa_desc: 'Disfruta de una experiencia de aplicación nativa completa con sincronización automática.',
    installed_status: '¡La aplicación ya está instalada!',
    sync_guarantee: 'Misma cuenta y sincronización total 100%',
  },
  de: {
    app_tagline: 'PRÄZISIONS-ERNÄHRUNG',
    dashboard: 'Übersicht',
    ai_recipes: 'KI-Rezepte & Tipps',
    scan_photo: 'KI-Fotoscan',
    describe_meal: 'Mahlzeit beschreiben',
    barcode: 'Barcode scannen',
    history: 'Verlauf & Fortschritt',
    profile: 'Profil & Ziele',
    quick_add: 'Essen hinzufügen',
    breakfast: 'Frühstück',
    lunch: 'Mittagessen',
    dinner: 'Abendessen',
    snack: 'Snack',
    calories: 'Kalorien',
    protein: 'Proteine',
    carbs: 'Kohlenhydrate',
    fat: 'Fett',
    water: 'Wasseraufnahme',
    target: 'Ziel',
    remaining: 'Verbleibend',
    over: 'Überschuss',
    select_language: 'App-Sprache',
    language_description: 'Wählen Sie aus über 30 Sprachen. Die KI analysiert in der gewählten Sprache.',
    search_language: 'Sprache suchen...',
    all_regions: 'Alle Regionen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    create_account: 'Konto erstellen',
    login: 'Anmelden',
    logout: 'Abmelden',
    language: 'Sprache',
    today: 'Heute',
    yesterday: 'Gestern',
    tomorrow: 'Morgen',
  },
  it: {
    app_tagline: 'NUTRIZIONE DI PRECISIONE',
    dashboard: 'Dashboard',
    ai_recipes: 'Ricette e IA',
    scan_photo: 'Scansione Foto IA',
    describe_meal: 'Descrivi pasto',
    barcode: 'Codice a barre',
    history: 'Cronologia e Progressi',
    profile: 'Profilo e Obiettivi',
    quick_add: 'Aggiungi Cibo',
    breakfast: 'Colazione',
    lunch: 'Pranzo',
    dinner: 'Cena',
    snack: 'Spuntino',
    calories: 'Calorie',
    protein: 'Proteine',
    carbs: 'Carboidrati',
    fat: 'Grassi',
    water: 'Idratazione',
    target: 'Obiettivo',
    remaining: 'Rimanente',
    over: 'Eccesso',
    select_language: 'Lingua dell’app',
    language_description: 'Scegli tra oltre 30 lingue supportate. L’IA si adatterà alla lingua scelta.',
    search_language: 'Cerca lingua...',
    all_regions: 'Tutte le regioni',
    save: 'Salva',
    cancel: 'Annulla',
    create_account: 'Crea Account',
    login: 'Accedi',
    logout: 'Esci',
    language: 'Lingua',
    today: 'Oggi',
    yesterday: 'Ieri',
    tomorrow: 'Domani',
  },
  pt: {
    app_tagline: 'NUTRIÇÃO DE PRECISÃO',
    dashboard: 'Painel Principal',
    ai_recipes: 'Receitas e Dicas IA',
    scan_photo: 'Digitalizar Foto IA',
    describe_meal: 'Descrever refeição',
    barcode: 'Código de barras',
    history: 'Histórico e Progresso',
    profile: 'Perfil e Metas',
    quick_add: 'Adicionar Alimento',
    breakfast: 'Café da manhã',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
    calories: 'Calorias',
    protein: 'Proteínas',
    carbs: 'Carboidratos',
    fat: 'Gorduras',
    water: 'Hidratação',
    target: 'Meta',
    remaining: 'Restante',
    over: 'Excesso',
    select_language: 'Idioma do Aplicativo',
    language_description: 'Escolha entre mais de 30 idiomas. A IA responderá no idioma selecionado.',
    search_language: 'Pesquisar idioma...',
    all_regions: 'Todas as regiões',
    save: 'Salvar',
    cancel: 'Cancelar',
    create_account: 'Criar Conta',
    login: 'Entrar',
    logout: 'Sair',
    language: 'Idioma',
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',
  },
  zh: {
    app_tagline: '精准营养控制',
    dashboard: '控制面板',
    ai_recipes: 'AI 食谱与建议',
    scan_photo: 'AI 拍照识别',
    describe_meal: '文字描述饮食',
    barcode: '条形码扫描',
    history: '历史与进度',
    profile: '个人档案与目标',
    quick_add: '添加食物',
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐/零食',
    calories: '卡路里',
    protein: '蛋白质',
    carbs: '碳水化合物',
    fat: '脂肪',
    water: '饮水量',
    target: '目标',
    remaining: '剩余',
    over: '超出',
    select_language: '应用语言设置',
    language_description: '提供 30+ 种语言选择。Gemini AI 分析与推荐将自动以所选语言呈现。',
    search_language: '搜索语言...',
    all_regions: '所有地区',
    save: '保存',
    cancel: '取消',
    create_account: '创建账户',
    login: '登录',
    logout: '退出登录',
    language: '语言',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
  },
  ja: {
    app_tagline: '精密栄養トラッキング',
    dashboard: 'ダッシュボード',
    ai_recipes: 'AIレシピ＆アドバイス',
    scan_photo: 'AI写真解析',
    describe_meal: '食事内容を入力',
    barcode: 'バーコードスキャン',
    history: '履歴＆進捗',
    profile: 'プロフィール＆目標',
    quick_add: '食品を追加',
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
    snack: '间食・スナック',
    calories: 'カロリー',
    protein: 'タンパク質',
    carbs: '炭水化物',
    fat: '脂質',
    water: '水分補給',
    target: '目標',
    remaining: '残り',
    over: '超過',
    select_language: 'アプリの言語',
    language_description: '30以上の言語に対応。AI解析およびアドバイスも選択した言語で生成されます。',
    search_language: '言語を検索...',
    all_regions: 'すべての地域',
    save: '保存',
    cancel: 'キャンセル',
    create_account: 'アカウント作成',
    login: 'ログイン',
    logout: 'ログアウト',
    language: '言語',
    today: '今日',
    yesterday: '昨日',
    tomorrow: '明日',
  },
  ar: {
    app_tagline: 'تغذية دقيقة بالذكاء الاصطناعي',
    dashboard: 'لوحة التحكم',
    ai_recipes: 'وصفات ونصائح الذكاء الاصطناعي',
    scan_photo: 'مسح الصور بالذكاء الاصطناعي',
    describe_meal: 'وصف الوجبة',
    barcode: 'مسح الباركود',
    history: 'السجل والتقدم',
    profile: 'الملف الشخصي والأهداف',
    quick_add: 'إضافة طعام',
    breakfast: 'الفطور',
    lunch: 'الغداء',
    dinner: 'العشاء',
    snack: 'وجبة خفيفة',
    calories: 'السعرات الحرارية',
    protein: 'البروتين',
    carbs: 'الكربوهيدرات',
    fat: 'الدهون',
    water: 'شرب الماء',
    target: 'الهدف',
    remaining: 'المتبقي',
    over: 'الفائض',
    select_language: 'لغة التطبيق',
    language_description: 'اختر من بين أكثر من 30 لغة. ستتكيف تحليلات الذكاء الاصطناعي مع اللغة المختارة.',
    search_language: 'بحث عن لغة...',
    all_regions: 'جميع المناطق',
    save: 'حفظ',
    cancel: 'إلغاء',
    create_account: 'إنشاء حساب',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
    today: 'اليوم',
    yesterday: 'الأمس',
    tomorrow: 'غداً',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? getLanguageByCode(saved) : getLanguageByCode('fr');
  });

  const setLanguageCode = (code: string) => {
    const lang = getLanguageByCode(code);
    setCurrentLanguage(lang);
    localStorage.setItem(STORAGE_KEY, code);
    if (lang.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  useEffect(() => {
    if (currentLanguage.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLanguage]);

  const t = (key: string, defaultText?: string): string => {
    const code = currentLanguage.code;
    if (TRANSLATIONS[code] && TRANSLATIONS[code][key]) {
      return TRANSLATIONS[code][key];
    }
    // Fallback to English, then French
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    if (TRANSLATIONS.fr && TRANSLATIONS.fr[key]) {
      return TRANSLATIONS.fr[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageCode,
        t,
        languages: LANGUAGES,
        isRTL: !!currentLanguage.rtl,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
