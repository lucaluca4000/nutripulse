export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose_rapid' | 'lose' | 'maintain' | 'gain' | 'gain_fast';

export type MacroPreset = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'custom';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  macroPreset: MacroPreset;
  // Custom ratios if macroPreset === 'custom'
  customProteinRatio?: number; // e.g. 0.30
  customCarbsRatio?: number;   // e.g. 0.40
  customFatRatio?: number;     // e.g. 0.30

  // Computed Targets
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number;   // in grams
  targetFat: number;     // in grams
  targetFiber: number;   // in grams
  targetWaterMl: number; // in ml
  targetSodiumMg: number; // in mg
  targetCalciumMg: number; // in mg
  targetVitaminCMg: number; // in mg
  targetIronMg: number; // in mg
}

export interface FoodItem {
  id: string;
  name: string;
  mealType: MealType;
  date: string; // Format YYYY-MM-DD
  timestamp: number;
  portionName: string; // e.g. "1 assiette (300g)", "100g"
  servingSizeGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  photoUrl?: string;
  source: 'ai_vision' | 'ai_text' | 'barcode' | 'manual' | 'preset';
  nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  brand?: string;
  barcode?: string;
  ingredients?: string[];
  aiAdvice?: string;
  breakdownItems?: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number;
  weightLogKg?: number;
  notes?: string;
}

export interface AiNutritionAnalysisResponse {
  dishName: string;
  description: string;
  servingSize: string;
  estimatedWeightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodiumMg: number;
  nutriScore: 'A' | 'B' | 'C' | 'D' | 'E';
  confidenceScore: number; // 0 to 100
  healthAdvice: string;
  itemsBreakdown: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  micronutrients?: {
    vitaminC?: string;
    calcium?: string;
    iron?: string;
    potassium?: string;
  };
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: number;
  avatarUrl?: string;
}

export interface AuthSession {
  user: UserAccount | null;
  isAuthenticated: boolean;
}

export interface FoodRecommendation {
  id: string;
  title: string;
  mealType: MealType;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutriScore: 'A' | 'B' | 'C';
  whyItFits: string;
  description: string;
  ingredients: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  recipeSummary?: string;
}

export interface RecommendationRequest {
  mealType: MealType | 'any';
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  goal: Goal;
  dietaryPreference?: 'all' | 'high_protein' | 'low_carb' | 'vegetarian' | 'quick_prep' | 'budget';
  customHint?: string;
}
