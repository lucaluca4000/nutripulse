import { DEFAULT_USER_PROFILE } from './calculator';
import { DailyLog, FoodItem, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'nutripulse_profile_v1',
  FOOD_LOGS: 'nutripulse_food_logs_v1',
  DAILY_LOGS: 'nutripulse_daily_logs_v1',
};

function getKey(baseKey: string, userId?: string): string {
  return userId ? `${baseKey}_usr_${userId}` : baseKey;
}

// Helper to format today's date YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserProfile(userId?: string): UserProfile {
  try {
    const key = getKey(STORAGE_KEYS.PROFILE, userId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    // Fallback to guest profile if user-specific hasn't been set yet
    if (userId) {
      const guestData = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (guestData) return JSON.parse(guestData);
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile, userId?: string): void {
  try {
    const key = getKey(STORAGE_KEYS.PROFILE, userId);
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile:', err);
  }
}

export function loadFoodLogs(userId?: string): FoodItem[] {
  try {
    const key = getKey(STORAGE_KEYS.FOOD_LOGS, userId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    // Fallback to guest logs if creating first account to preserve existing work
    if (userId) {
      const guestData = localStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
      if (guestData) return JSON.parse(guestData);
    }
  } catch (err) {
    console.error('Error loading food logs:', err);
  }

  // Seed default items for today so user gets instant experience
  const today = getTodayDateString();
  const initialLogs: FoodItem[] = [
    {
      id: 'seed-1',
      name: 'Omelette 3 œufs & Avocat sur toast',
      mealType: 'breakfast',
      date: today,
      timestamp: Date.now() - 1000 * 60 * 60 * 4,
      portionName: '1 assiette',
      servingSizeGrams: 280,
      calories: 460,
      protein: 28,
      carbs: 24,
      fat: 26,
      fiber: 6,
      nutriScore: 'A',
      source: 'ai_vision',
      aiAdvice: 'Excellent apport en protéines complètes et lipides sains (oméga-9).',
      breakdownItems: [
        { name: 'Œufs bio (3 gros)', portion: '150g', calories: 210, protein: 18, carbs: 1, fat: 15 },
        { name: 'Pain complet au levain', portion: '70g', calories: 160, protein: 6, carbs: 22, fat: 2 },
        { name: 'Avocat frais', portion: '60g', calories: 90, protein: 4, carbs: 1, fat: 9 },
      ],
    },
    {
      id: 'seed-2',
      name: 'Filet de Saumon, Riz Basmati & Courgettes',
      mealType: 'lunch',
      date: today,
      timestamp: Date.now() - 1000 * 60 * 60 * 1,
      portionName: '1 plat principal',
      servingSizeGrams: 420,
      calories: 610,
      protein: 44,
      carbs: 52,
      fat: 22,
      fiber: 5,
      nutriScore: 'A',
      source: 'ai_vision',
      aiAdvice: 'Riche en Oméga-3 et glucides complexes à indice glycémique modéré.',
      breakdownItems: [
        { name: 'Filet de saumon atlantique', portion: '180g', calories: 360, protein: 36, carbs: 0, fat: 22 },
        { name: 'Riz basmati cuit', portion: '180g', calories: 210, protein: 5, carbs: 46, fat: 1 },
        { name: 'Courgettes poêlées huile d\'olive', portion: '100g', calories: 40, protein: 3, carbs: 6, fat: 1 },
      ],
    },
    {
      id: 'seed-3',
      name: 'Skyr Islendais & Myrtilles fraîches',
      mealType: 'snack',
      date: today,
      timestamp: Date.now() - 1000 * 60 * 30,
      portionName: '1 bol (200g)',
      servingSizeGrams: 200,
      calories: 180,
      protein: 22,
      carbs: 16,
      fat: 1,
      fiber: 3,
      nutriScore: 'A',
      source: 'preset',
      aiAdvice: 'Collation hyper-protéinée sans graisses saturées.',
    },
  ];

  try {
    const key = getKey(STORAGE_KEYS.FOOD_LOGS, userId);
    localStorage.setItem(key, JSON.stringify(initialLogs));
  } catch (e) {
    // ignore
  }

  return initialLogs;
}

export function saveFoodLogs(logs: FoodItem[], userId?: string): void {
  try {
    const key = getKey(STORAGE_KEYS.FOOD_LOGS, userId);
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving food logs:', err);
  }
}

export function loadDailyLogs(userId?: string): Record<string, DailyLog> {
  try {
    const key = getKey(STORAGE_KEYS.DAILY_LOGS, userId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    if (userId) {
      const guestData = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (guestData) return JSON.parse(guestData);
    }
  } catch (err) {
    console.error('Error loading daily logs:', err);
  }
  const today = getTodayDateString();
  const initialDailyLogs: Record<string, DailyLog> = {
    [today]: {
      date: today,
      waterIntakeMl: 1250,
      weightLogKg: 74.8,
    },
  };
  return initialDailyLogs;
}

export function saveDailyLogs(logs: Record<string, DailyLog>, userId?: string): void {
  try {
    const key = getKey(STORAGE_KEYS.DAILY_LOGS, userId);
    localStorage.setItem(key, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving daily logs:', err);
  }
}
