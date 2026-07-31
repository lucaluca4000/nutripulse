import { ActivityLevel, Gender, Goal, MacroPreset, UserProfile } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { name: string; description: string; factor: number }> = {
  sedentary: {
    name: 'Sédentaire',
    description: 'Travail de bureau, très peu ou pas d’exercice',
    factor: 1.2,
  },
  light: {
    name: 'Légèrement actif',
    description: 'Exercice léger 1 à 3 fois par semaine',
    factor: 1.375,
  },
  moderate: {
    name: 'Modérément actif',
    description: 'Sport régulier 3 à 5 fois par semaine',
    factor: 1.55,
  },
  active: {
    name: 'Très actif',
    description: 'Entraînement intense 6 à 7 fois par semaine',
    factor: 1.725,
  },
  very_active: {
    name: 'Extrêmement actif',
    description: 'Sport quotidien très intense ou travail physique dur',
    factor: 1.9,
  },
};

export const GOAL_ADJUSTMENTS: Record<Goal, { name: string; description: string; multiplier: number }> = {
  lose_rapid: {
    name: 'Perte de poids rapide',
    description: 'Déficit calorique de -20%',
    multiplier: 0.8,
  },
  lose: {
    name: 'Perte de poids progressive',
    description: 'Déficit modéré de -15%',
    multiplier: 0.85,
  },
  maintain: {
    name: 'Maintien du poids',
    description: 'Équilibre calorique (0%)',
    multiplier: 1.0,
  },
  gain: {
    name: 'Prise de masse propre',
    description: 'Surplus léger de +15%',
    multiplier: 1.15,
  },
  gain_fast: {
    name: 'Prise de masse rapide',
    description: 'Surplus soutenu de +25%',
    multiplier: 1.25,
  },
};

export const MACRO_PRESETS: Record<MacroPreset, { name: string; description: string; pRatio: number; cRatio: number; fRatio: number }> = {
  balanced: {
    name: 'Équilibré',
    description: '30% Protéines / 40% Glucides / 30% Lipides',
    pRatio: 0.3,
    cRatio: 0.4,
    fRatio: 0.3,
  },
  high_protein: {
    name: 'Haute Protéine (Musculation)',
    description: '40% Protéines / 35% Glucides / 25% Lipides',
    pRatio: 0.4,
    cRatio: 0.35,
    fRatio: 0.25,
  },
  low_carb: {
    name: 'Low Carb (Faible en glucides)',
    description: '35% Protéines / 20% Glucides / 45% Lipides',
    pRatio: 0.35,
    cRatio: 0.2,
    fRatio: 0.45,
  },
  keto: {
    name: 'Cétogène (Keto)',
    description: '25% Protéines / 5% Glucides / 70% Lipides',
    pRatio: 0.25,
    cRatio: 0.05,
    fRatio: 0.7,
  },
  custom: {
    name: 'Personnalisé',
    description: 'Définissez vos propres ratios',
    pRatio: 0.3,
    cRatio: 0.4,
    fRatio: 0.3,
  },
};

/**
 * Calculate BMR using Mifflin-St Jeor Formula
 */
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // Average
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }
}

/**
 * Calculate complete user nutrition targets
 */
export function calculateUserProfileTargets(params: {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  macroPreset: MacroPreset;
  customProteinRatio?: number;
  customCarbsRatio?: number;
  customFatRatio?: number;
}): UserProfile {
  const { age, gender, heightCm, weightKg, targetWeightKg, activityLevel, goal, macroPreset } = params;

  // 1. Calculate BMR
  const bmr = Math.round(calculateBMR(gender, weightKg, heightCm, age));

  // 2. Calculate TDEE
  const actFactor = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.375;
  const tdee = Math.round(bmr * actFactor);

  // 3. Goal Calories
  const goalMult = GOAL_ADJUSTMENTS[goal]?.multiplier || 1.0;
  const targetCalories = Math.max(1200, Math.round(tdee * goalMult));

  // 4. Macro ratios
  let pRatio = MACRO_PRESETS[macroPreset]?.pRatio || 0.3;
  let cRatio = MACRO_PRESETS[macroPreset]?.cRatio || 0.4;
  let fRatio = MACRO_PRESETS[macroPreset]?.fRatio || 0.3;

  if (macroPreset === 'custom' && params.customProteinRatio !== undefined && params.customCarbsRatio !== undefined && params.customFatRatio !== undefined) {
    pRatio = params.customProteinRatio;
    cRatio = params.customCarbsRatio;
    fRatio = params.customFatRatio;
  }

  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const targetProtein = Math.round((targetCalories * pRatio) / 4);
  const targetCarbs = Math.round((targetCalories * cRatio) / 4);
  const targetFat = Math.round((targetCalories * fRatio) / 9);

  // Fiber: ~14g per 1000 kcal
  const targetFiber = Math.round((targetCalories / 1000) * 14);

  // Water: ~35ml per kg bodyweight
  const targetWaterMl = Math.round(Math.max(2000, weightKg * 35));

  // Micros defaults
  const targetSodiumMg = 2300;
  const targetCalciumMg = 1000;
  const targetVitaminCMg = 90;
  const targetIronMg = gender === 'female' ? 18 : 8;

  return {
    age,
    gender,
    heightCm,
    weightKg,
    targetWeightKg,
    activityLevel,
    goal,
    macroPreset,
    customProteinRatio: params.customProteinRatio,
    customCarbsRatio: params.customCarbsRatio,
    customFatRatio: params.customFatRatio,
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    targetFiber,
    targetWaterMl,
    targetSodiumMg,
    targetCalciumMg,
    targetVitaminCMg,
    targetIronMg,
  };
}

export const DEFAULT_USER_PROFILE: UserProfile = calculateUserProfileTargets({
  age: 28,
  gender: 'male',
  heightCm: 178,
  weightKg: 75,
  targetWeightKg: 72,
  activityLevel: 'moderate',
  goal: 'lose',
  macroPreset: 'high_protein',
});
