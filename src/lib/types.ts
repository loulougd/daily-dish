export type Goal = "lose" | "muscle" | "maintain" | "better";
export type Guidance = "calories" | "portions";
export type TimeBucket = "t10" | "t20" | "t45" | "prep";
export type Effort = "nobrain" | "simple" | "proper";
export type Intensity = "rest" | "light" | "moderate" | "intense";
export type Budget = "low" | "medium" | "high";
export type EnergyLevel = "low" | "normal" | "motivated";
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";
export type MealType = "breakfast" | "lunch" | "dinner";
export type SleepQuality = "rough" | "ok" | "great";

export type Sex = "female" | "male" | "na";
export type ActivityLevel = "sedentary" | "light" | "active" | "veryactive";

export interface CycleSettings {
  enabled: boolean;
  lastPeriodISO?: string;
  cycleLength: number;
}

export interface UserProfile {
  goal: Goal;
  guidance: Guidance;
  time: TimeBucket;
  effort: Effort;
  training: Record<number, Intensity>;
  diet: string[];
  dietOther: string;
  allergies: string[]; // strict exclusion — never serve these ingredients
  hated: string[];     // soft preference — avoid but not dangerous
  style: number;
  budget: Budget;
  household: number;
  city: string;
  cycle: CycleSettings;
  // Biometrics (all optional — 0 means "not set")
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  onboarded: boolean;
}

export type CycleSymptom = "cramps" | "bloating" | "fatigue" | "cravings" | "headache";

export interface DailyContext {
  energy: EnergyLevel;
  sleepQuality: SleepQuality;
  timeToday: TimeBucket;
  useUp: string[];
  dateISO: string;
  theme: string;
  symptoms: CycleSymptom[];
}

// Meal feedback — stored separately in localStorage
export interface MealFeedback {
  recipeId: string;
  vote: "up" | "down";
  date: string;
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  imagePrompt: string;
  prepMinutes: number;
  effort: Effort;
  budget: Budget;
  tags: string[];
  contains: string[];
  ingredients: { name: string; qtyPerServing: string; category: GroceryCategory }[];
  steps: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portions: { protein: string; carbs: string; veg: string; fats: string };
  warmth: "warm" | "cool" | "neutral";
  carbDensity: "low" | "medium" | "high";
  style: "clean" | "balanced" | "comfort";
}

export interface CustomRecipe extends Recipe {
  source: "custom";
  weeklyStaple: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GroceryCategory =
  | "produce"
  | "protein"
  | "dairy"
  | "grains"
  | "pantry"
  | "other";

export interface Weather {
  tempC: number;
  condition: string;
  feel: "cold" | "cool" | "mild" | "warm" | "hot";
}