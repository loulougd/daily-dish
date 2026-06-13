import type { ActivityLevel, Goal, Intensity, UserProfile } from "./types";

const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  active: 1.55,
  veryactive: 1.725,
};

const TRAINING_BONUS: Record<Intensity, number> = {
  rest: 0,
  light: 150,
  moderate: 300,
  intense: 500,
};

const GOAL_DELTA: Record<Goal, number> = {
  lose: -400,
  muscle: 300,
  maintain: 0,
  better: 0,
};

const MACRO_SPLIT: Record<Goal, { p: number; c: number; f: number }> = {
  lose: { p: 0.4, c: 0.3, f: 0.3 },
  muscle: { p: 0.3, c: 0.45, f: 0.25 },
  maintain: { p: 0.3, c: 0.4, f: 0.3 },
  better: { p: 0.3, c: 0.4, f: 0.3 },
};

export interface DailyTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  hasData: boolean;
}

export function hasBiometrics(p: UserProfile): boolean {
  return p.weightKg > 0 && p.heightCm > 0 && p.age > 0;
}

export function calcBMR(p: UserProfile): number {
  if (!hasBiometrics(p)) return 0;
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : p.sex === "female" ? base - 161 : base - 78;
}

export function calcDailyTargets(p: UserProfile, trainingToday: Intensity = "rest"): DailyTargets {
  if (!hasBiometrics(p)) {
    return { kcal: 0, proteinG: 0, carbsG: 0, fatsG: 0, hasData: false };
  }
  const bmr = calcBMR(p);
  const tdee = bmr * ACTIVITY_MULT[p.activityLevel] + TRAINING_BONUS[trainingToday];
  const kcal = Math.round(tdee + GOAL_DELTA[p.goal]);
  const split = MACRO_SPLIT[p.goal];
  return {
    kcal,
    proteinG: Math.round((kcal * split.p) / 4),
    carbsG: Math.round((kcal * split.c) / 4),
    fatsG: Math.round((kcal * split.f) / 9),
    hasData: true,
  };
}

// Portion multiplier based on body size — applied when guidance="portions".
export function portionScale(p: UserProfile): number {
  if (p.weightKg <= 0) return 1;
  if (p.weightKg < 55) return 1;
  if (p.weightKg < 75) return 1.15;
  if (p.weightKg < 95) return 1.3;
  return 1.5;
}

// Calorie-based ingredient scale: ratio of (per-meal target) to recipe.calories.
// Clamped to a sensible range so we don't 3x or 0.4x a recipe.
export function calorieScaleForMeal(
  p: UserProfile,
  recipeCalories: number,
  mealShare = 1 / 3,
  trainingToday: Intensity = "rest",
): number {
  const t = calcDailyTargets(p, trainingToday);
  if (!t.hasData || !recipeCalories) return 1;
  const target = t.kcal * mealShare;
  const ratio = target / recipeCalories;
  return Math.max(0.7, Math.min(1.6, ratio));
}
