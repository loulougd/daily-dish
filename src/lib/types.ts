export type Goal = "lose" | "muscle" | "maintain" | "better";
export type Guidance = "calories" | "portions";
export type TimeBucket = "t10" | "t20" | "t45" | "prep";
export type Effort = "nobrain" | "simple" | "proper";
export type Intensity = "rest" | "light" | "moderate" | "intense";
export type Budget = "low" | "medium" | "high";
export type EnergyLevel = "low" | "normal" | "motivated";
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";
export type MealType = "breakfast" | "lunch" | "dinner";

export interface CycleSettings {
  enabled: boolean;
  lastPeriodISO?: string; // YYYY-MM-DD
  cycleLength: number; // days
}

export interface UserProfile {
  goal: Goal;
  guidance: Guidance;
  time: TimeBucket;
  effort: Effort;
  training: Record<number, Intensity>; // 0=Sun … 6=Sat
  diet: string[]; // tags
  dietOther: string;
  hated: string[];
  style: number; // 0..100  (0=clean, 50=balanced, 100=comfort)
  budget: Budget;
  household: number;
  city: string;
  cycle: CycleSettings;
  // Runtime
  onboarded: boolean;
}

export interface DailyContext {
  energy: EnergyLevel;
  timeToday: TimeBucket;
  useUp: string[];
  dateISO: string; // YYYY-MM-DD
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  imagePrompt: string;
  prepMinutes: number;
  effort: Effort;
  budget: Budget;
  tags: string[]; // dietary tags it satisfies, e.g. ["vegetarian","gluten-free"]
  contains: string[]; // ingredient keywords used for hate-food filtering
  ingredients: { name: string; qtyPerServing: string; category: GroceryCategory }[];
  steps: string[];
  calories: number; // per serving
  protein: number;
  carbs: number;
  fats: number;
  portions: { protein: string; carbs: string; veg: string; fats: string };
  warmth: "warm" | "cool" | "neutral"; // weather match
  carbDensity: "low" | "medium" | "high"; // training match
  style: "clean" | "balanced" | "comfort";
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
  condition: string; // "Cloudy", "Sunny", "Rain"…
  feel: "cold" | "cool" | "mild" | "warm" | "hot";
}
