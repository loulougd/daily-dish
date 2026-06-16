import { useCallback, useEffect, useState } from "react";
import type { Budget, CustomRecipe, Effort, GroceryCategory, MealType } from "./types";

const CUSTOM_RECIPES_KEY = "forkcast.customRecipes.v1";

export interface CustomRecipeForm {
  name: string;
  mealType: MealType;
  ingredientsText: string;
  stepsText: string;
  prepMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  weeklyStaple: boolean;
}

const defaultPortions = {
  protein: "Use your usual protein portion",
  carbs: "Use your usual carb portion",
  veg: "Add vegetables to taste",
  fats: "Use fats to taste",
};

export function readCustomRecipes(): CustomRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCustomRecipe) : [];
  } catch {
    return [];
  }
}

function writeCustomRecipes(recipes: CustomRecipe[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
}

export function useCustomRecipes() {
  const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecipes(readCustomRecipes());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater: (current: CustomRecipe[]) => CustomRecipe[]) => {
    setRecipes((current) => {
      const next = updater(current);
      writeCustomRecipes(next);
      return next;
    });
  }, []);

  const addRecipe = useCallback(
    (form: CustomRecipeForm) => {
      const now = new Date().toISOString();
      const recipe = formToRecipe(form, now);
      persist((current) => [recipe, ...current]);
      return recipe;
    },
    [persist],
  );

  const removeRecipe = useCallback(
    (id: string) => {
      persist((current) => current.filter((recipe) => recipe.id !== id));
    },
    [persist],
  );

  const toggleWeeklyStaple = useCallback(
    (id: string) => {
      persist((current) =>
        current.map((recipe) =>
          recipe.id === id
            ? { ...recipe, weeklyStaple: !recipe.weeklyStaple, updatedAt: new Date().toISOString() }
            : recipe,
        ),
      );
    },
    [persist],
  );

  return { recipes, hydrated, addRecipe, removeRecipe, toggleWeeklyStaple };
}

function formToRecipe(form: CustomRecipeForm, now: string): CustomRecipe {
  const ingredients = parseIngredients(form.ingredientsText);
  const steps = form.stepsText
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);
  const contains = ingredients.map((ingredient) => ingredient.name.toLowerCase());
  const effort = effortFromPrep(form.prepMinutes);
  const carbDensity = form.carbs >= 55 ? "high" : form.carbs <= 20 ? "low" : "medium";
  const style = form.calories >= 650 || form.fats >= 28 ? "comfort" : "balanced";

  return {
    id: makeCustomId(),
    source: "custom",
    weeklyStaple: form.weeklyStaple,
    createdAt: now,
    updatedAt: now,
    name: form.name.trim(),
    mealType: form.mealType,
    imagePrompt: `${form.name.trim()} homemade meal`,
    prepMinutes: Math.max(1, Math.round(form.prepMinutes || 15)),
    effort,
    budget: budgetFromIngredients(ingredients.length),
    tags: ["custom"],
    contains,
    ingredients,
    steps: steps.length ? steps : ["Cook this meal your usual way."],
    calories: Math.max(0, Math.round(form.calories || 0)),
    protein: Math.max(0, Math.round(form.protein || 0)),
    carbs: Math.max(0, Math.round(form.carbs || 0)),
    fats: Math.max(0, Math.round(form.fats || 0)),
    portions: defaultPortions,
    warmth: "neutral",
    carbDensity,
    style,
  };
}

function parseIngredients(value: string): CustomRecipe["ingredients"] {
  const lines = value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const match = line.match(/^([\d.,/]+\s*(?:g|kg|ml|l|tbsp|tsp|cup|cups|slice|slices|handful|handfuls|pinch|pinches)?)\s+(.+)$/i);
    const qtyPerServing = match?.[1]?.trim() || "1 serving";
    const name = (match?.[2] || line).trim();
    return {
      name,
      qtyPerServing,
      category: guessCategory(name),
    };
  });
}

function guessCategory(name: string): GroceryCategory {
  const n = name.toLowerCase();
  if (/\b(chicken|beef|pork|salmon|tuna|fish|egg|tofu|tempeh|turkey|shrimp|prawn)\b/.test(n)) return "protein";
  if (/\b(yogurt|yoghurt|milk|cheese|feta|butter|cream)\b/.test(n)) return "dairy";
  if (/\b(rice|pasta|bread|oats|quinoa|noodle|wrap|tortilla|flour)\b/.test(n)) return "grains";
  if (/\b(oil|salt|pepper|spice|sauce|honey|mustard|vinegar|nuts|seed)\b/.test(n)) return "pantry";
  if (/\b(apple|banana|berry|berries|tomato|spinach|lettuce|pepper|onion|garlic|carrot|broccoli|courgette|zucchini|lemon|lime|herb)\b/.test(n)) return "produce";
  return "other";
}

function effortFromPrep(minutes: number): Effort {
  if (minutes <= 12) return "nobrain";
  if (minutes <= 35) return "simple";
  return "proper";
}

function budgetFromIngredients(count: number): Budget {
  if (count <= 5) return "low";
  if (count <= 9) return "medium";
  return "high";
}

function makeCustomId() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `custom-${random}`;
}

function isCustomRecipe(value: unknown): value is CustomRecipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as Partial<CustomRecipe>;
  return Boolean(
    recipe.id &&
      recipe.name &&
      recipe.mealType &&
      Array.isArray(recipe.ingredients) &&
      Array.isArray(recipe.steps) &&
      recipe.source === "custom",
  );
}
