import { useCallback, useEffect, useState } from "react";
import type { Budget, Effort, GroceryCategory, MealType, Recipe, UserProfile } from "./types";

const CACHE_KEY = "forkcast.externalRecipes.v1";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY as string | undefined;

interface CachedExternalRecipes {
  recipes: Recipe[];
  fetchedAt: number;
  provider: "spoonacular" | "themealdb";
}

interface ExternalCatalogState {
  recipes: Recipe[];
  hydrated: boolean;
  loading: boolean;
  provider: "spoonacular" | "themealdb" | "cache" | "none";
  refresh: () => Promise<void>;
}

export function readExternalRecipes(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const cached = JSON.parse(raw) as CachedExternalRecipes;
    if (!Array.isArray(cached.recipes)) return [];
    return cached.recipes.filter(isRecipe);
  } catch {
    return [];
  }
}

export function useExternalRecipeCatalog(profile: UserProfile): ExternalCatalogState {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ExternalCatalogState["provider"]>("none");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchExternalRecipes(profile);
      if (next.recipes.length) {
        writeCache(next.recipes, next.provider);
        setRecipes(next.recipes);
        setProvider(next.provider);
      }
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [profile]);

  useEffect(() => {
    const cached = readCache();
    if (cached?.recipes.length) {
      setRecipes(cached.recipes);
      setProvider("cache");
      setHydrated(true);
      if (Date.now() - cached.fetchedAt < CACHE_TTL) return;
    }
    refresh().catch(() => {
      setHydrated(true);
      setLoading(false);
    });
  }, [refresh]);

  return { recipes, hydrated, loading, provider, refresh };
}

async function fetchExternalRecipes(profile: UserProfile): Promise<{
  recipes: Recipe[];
  provider: "spoonacular" | "themealdb";
}> {
  if (SPOONACULAR_KEY) {
    const recipes = await fetchSpoonacularRecipes(profile);
    if (recipes.length) return { recipes, provider: "spoonacular" };
  }

  return { recipes: await fetchMealDbRecipes(), provider: "themealdb" };
}

function readCache(): CachedExternalRecipes | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedExternalRecipes;
    return Array.isArray(parsed.recipes) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(recipes: Recipe[], provider: CachedExternalRecipes["provider"]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ recipes, provider, fetchedAt: Date.now() } satisfies CachedExternalRecipes),
  );
}

async function fetchSpoonacularRecipes(profile: UserProfile): Promise<Recipe[]> {
  const diet = spoonacularDiet(profile);
  const intolerance = spoonacularIntolerances(profile);
  const requests = (["breakfast", "lunch", "dinner"] as MealType[]).map(async (mealType) => {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_KEY ?? "",
      number: "60",
      offset: String(Math.floor(Math.random() * 600)),
      type: mealType === "breakfast" ? "breakfast" : "main course",
      addRecipeInformation: "true",
      addRecipeNutrition: "true",
      instructionsRequired: "true",
      sort: "random",
    });
    if (diet) params.set("diet", diet);
    if (intolerance) params.set("intolerances", intolerance);

    const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`);
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.results ?? []) as SpoonacularRecipe[]).map((recipe) => spoonacularToRecipe(recipe, mealType));
  });

  const groups = await Promise.all(requests);
  return uniqueRecipes(groups.flat()).slice(0, 180);
}

function spoonacularDiet(profile: UserProfile): string {
  const diet = profile.diet.map((d) => d.toLowerCase());
  if (diet.includes("vegan")) return "vegan";
  if (diet.includes("vegetarian")) return "vegetarian";
  if (diet.includes("pescatarian")) return "pescetarian";
  return "";
}

function spoonacularIntolerances(profile: UserProfile): string {
  const values: string[] = [];
  const diet = profile.diet.map((d) => d.toLowerCase());
  if (diet.includes("gluten-free")) values.push("gluten");
  if (diet.includes("lactose-free")) values.push("dairy");
  if (diet.includes("nut-free")) values.push("peanut", "tree nut");
  values.push(...(profile.allergies ?? []));
  return values.map((v) => v.trim()).filter(Boolean).join(",");
}

async function fetchMealDbRecipes(): Promise<Recipe[]> {
  const searches: { mealType: MealType; terms: string[] }[] = [
    { mealType: "breakfast", terms: ["breakfast", "egg", "oats", "pancake"] },
    { mealType: "lunch", terms: ["chicken", "salmon", "rice", "vegetarian", "pasta", "soup"] },
    { mealType: "dinner", terms: ["beef", "curry", "pasta", "fish", "chicken", "stew"] },
  ];

  const results = await Promise.all(
    searches.flatMap(({ mealType, terms }) =>
      terms.map(async (term) => {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
        if (!res.ok) return [];
        const data = await res.json();
        return ((data.meals ?? []) as MealDbRecipe[]).map((recipe) => mealDbToRecipe(recipe, mealType));
      }),
    ),
  );

  return uniqueRecipes(results.flat()).slice(0, 120);
}

function spoonacularToRecipe(recipe: SpoonacularRecipe, mealType: MealType): Recipe {
  const nutrients = recipe.nutrition?.nutrients ?? [];
  const kcal = nutrient(nutrients, "Calories");
  const protein = nutrient(nutrients, "Protein");
  const carbs = nutrient(nutrients, "Carbohydrates");
  const fats = nutrient(nutrients, "Fat");
  const ingredients = (recipe.extendedIngredients ?? []).slice(0, 12).map((ingredient) => ({
    name: ingredient.nameClean || ingredient.name || "Ingredient",
    qtyPerServing: formatQty(ingredient.amount, ingredient.unit),
    category: guessCategory(ingredient.nameClean || ingredient.name || ""),
  }));

  return {
    id: `spoon-${recipe.id}`,
    name: stripHtml(recipe.title),
    mealType,
    imagePrompt: recipe.image || `${recipe.title} recipe`,
    prepMinutes: recipe.readyInMinutes || 25,
    effort: effortFromPrep(recipe.readyInMinutes || 25),
    budget: budgetFromIngredients(ingredients.length),
    tags: ["external", "spoonacular", ...(recipe.diets ?? [])],
    contains: ingredients.map((ingredient) => ingredient.name.toLowerCase()),
    ingredients,
    steps: instructionsToSteps(recipe.analyzedInstructions, recipe.instructions),
    calories: Math.round(kcal || estimateCalories(mealType)),
    protein: Math.round(protein || estimateProtein(mealType)),
    carbs: Math.round(carbs || estimateCarbs(mealType)),
    fats: Math.round(fats || estimateFats(mealType)),
    portions: defaultPortions(),
    warmth: "neutral",
    carbDensity: carbDensity(carbs || estimateCarbs(mealType)),
    style: styleFromMacros(kcal || estimateCalories(mealType), fats || estimateFats(mealType)),
  };
}

function mealDbToRecipe(recipe: MealDbRecipe, mealType: MealType): Recipe {
  const ingredients = mealDbIngredients(recipe);
  const calories = estimateCalories(mealType);
  const protein = estimateProtein(mealType);
  const carbs = estimateCarbs(mealType);
  const fats = estimateFats(mealType);

  return {
    id: `mealdb-${recipe.idMeal}`,
    name: recipe.strMeal,
    mealType,
    imagePrompt: recipe.strMealThumb || `${recipe.strMeal} recipe`,
    prepMinutes: mealType === "breakfast" ? 20 : 35,
    effort: mealType === "breakfast" ? "simple" : "proper",
    budget: budgetFromIngredients(ingredients.length),
    tags: ["external", "themealdb", recipe.strCategory?.toLowerCase(), recipe.strArea?.toLowerCase()].filter(Boolean),
    contains: ingredients.map((ingredient) => ingredient.name.toLowerCase()),
    ingredients,
    steps: recipe.strInstructions
      ?.split(/\r?\n|\.\s+/)
      .map((step) => step.trim())
      .filter((step) => step.length > 8)
      .slice(0, 8) || ["Cook this recipe using the listed ingredients."],
    calories,
    protein,
    carbs,
    fats,
    portions: defaultPortions(),
    warmth: "neutral",
    carbDensity: carbDensity(carbs),
    style: styleFromMacros(calories, fats),
  };
}

function mealDbIngredients(recipe: MealDbRecipe): Recipe["ingredients"] {
  const out: Recipe["ingredients"] = [];
  for (let i = 1; i <= 20; i++) {
    const name = recipe[`strIngredient${i}`]?.trim();
    if (!name) continue;
    const measure = recipe[`strMeasure${i}`]?.trim() || "1 serving";
    out.push({ name, qtyPerServing: measure, category: guessCategory(name) });
  }
  return out;
}

function instructionsToSteps(analyzed: SpoonacularInstruction[] | undefined, fallback?: string): string[] {
  const steps = analyzed?.flatMap((group) => group.steps?.map((step) => stripHtml(step.step)) ?? []) ?? [];
  if (steps.length) return steps.slice(0, 8);
  if (fallback) {
    return stripHtml(fallback)
      .split(/\.\s+/)
      .map((step) => step.trim())
      .filter((step) => step.length > 8)
      .slice(0, 8);
  }
  return ["Cook this recipe using the listed ingredients."];
}

function nutrient(nutrients: SpoonacularNutrient[], name: string): number {
  return nutrients.find((item) => item.name === name)?.amount ?? 0;
}

function uniqueRecipes(recipes: Recipe[]): Recipe[] {
  const seen = new Set<string>();
  return recipes.filter((recipe) => {
    if (seen.has(recipe.id)) return false;
    seen.add(recipe.id);
    return Boolean(recipe.name && recipe.ingredients.length);
  });
}

function defaultPortions() {
  return {
    protein: "1 palm protein",
    carbs: "1 fist carbs",
    veg: "1-2 fists veg",
    fats: "1 thumb fats",
  };
}

function formatQty(amount?: number, unit?: string) {
  if (!amount) return "1 serving";
  const rounded = amount >= 10 ? Math.round(amount) : Math.round(amount * 10) / 10;
  return `${rounded} ${unit ?? ""}`.trim();
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function guessCategory(name: string): GroceryCategory {
  const n = name.toLowerCase();
  if (/\b(chicken|beef|pork|salmon|tuna|fish|egg|tofu|tempeh|turkey|shrimp|prawn|lamb)\b/.test(n)) return "protein";
  if (/\b(yogurt|yoghurt|milk|cheese|feta|butter|cream|parmesan|mozzarella)\b/.test(n)) return "dairy";
  if (/\b(rice|pasta|bread|oats|quinoa|noodle|wrap|tortilla|flour|potato)\b/.test(n)) return "grains";
  if (/\b(oil|salt|pepper|spice|sauce|honey|mustard|vinegar|nuts|seed|stock|broth)\b/.test(n)) return "pantry";
  if (/\b(apple|banana|berry|berries|tomato|spinach|lettuce|pepper|onion|garlic|carrot|broccoli|lemon|lime|herb|parsley|coriander)\b/.test(n)) return "produce";
  return "other";
}

function effortFromPrep(minutes: number): Effort {
  if (minutes <= 12) return "nobrain";
  if (minutes <= 35) return "simple";
  return "proper";
}

function budgetFromIngredients(count: number): Budget {
  if (count <= 5) return "low";
  if (count <= 10) return "medium";
  return "high";
}

function carbDensity(carbs: number): Recipe["carbDensity"] {
  if (carbs >= 55) return "high";
  if (carbs <= 20) return "low";
  return "medium";
}

function styleFromMacros(calories: number, fats: number): Recipe["style"] {
  if (calories >= 650 || fats >= 28) return "comfort";
  if (calories <= 430 && fats <= 16) return "clean";
  return "balanced";
}

function estimateCalories(mealType: MealType) {
  return mealType === "breakfast" ? 420 : mealType === "lunch" ? 560 : 640;
}
function estimateProtein(mealType: MealType) {
  return mealType === "breakfast" ? 22 : mealType === "lunch" ? 34 : 38;
}
function estimateCarbs(mealType: MealType) {
  return mealType === "breakfast" ? 42 : mealType === "lunch" ? 55 : 60;
}
function estimateFats(mealType: MealType) {
  return mealType === "breakfast" ? 16 : mealType === "lunch" ? 20 : 24;
}

function isRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as Partial<Recipe>;
  return Boolean(recipe.id && recipe.name && recipe.mealType && Array.isArray(recipe.ingredients));
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  diets?: string[];
  instructions?: string;
  analyzedInstructions?: SpoonacularInstruction[];
  extendedIngredients?: { name?: string; nameClean?: string; amount?: number; unit?: string }[];
  nutrition?: { nutrients?: SpoonacularNutrient[] };
}

interface SpoonacularInstruction {
  steps?: { step: string }[];
}

interface SpoonacularNutrient {
  name: string;
  amount: number;
}

interface MealDbRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}
