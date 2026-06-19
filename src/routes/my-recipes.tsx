import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Heart, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCustomRecipes, useFavorites } from "@/lib/profile";
import { RECIPES } from "@/lib/recipes-data";
import { photoUrl } from "@/lib/recipe-photos";
import type { Recipe, MealType, Effort, Budget, GroceryCategory } from "@/lib/types";

export const Route = createFileRoute("/my-recipes")({
  head: () => ({
    meta: [
      { title: "My Recipes — Forkcast" },
      { name: "description", content: "Your saved recipes and custom meals." },
    ],
  }),
  component: MyRecipesPage,
});

function MyRecipesPage() {
  const { recipes: custom, add, remove } = useCustomRecipes();
  const { favorites, toggle: toggleFav, toggleStaple, isFav, isStaple } = useFavorites();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"favorites" | "custom">("favorites");

  // All built-in recipes that are favorited
  const favBuiltIn = RECIPES.filter((r) => isFav(r.id));

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="text-terracotta font-semibold text-xs uppercase tracking-widest mb-1">
          My Recipes
        </p>
        <h1 className="font-serif text-[2rem] leading-tight">
          Your collection
        </h1>
        <p className="text-ink/60 text-sm mt-2 leading-relaxed">
          Favorites appear more often. Weekly staples get priority every week.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 px-6 mb-5">
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "favorites"
              ? "bg-ink text-cream"
              : "bg-card border border-stone-warm text-ink/60"
          }`}
        >
          <Heart className="size-3.5 inline mr-1.5" strokeWidth={2} />
          Favorites ({favBuiltIn.length + custom.filter((r) => isFav(r.id)).length})
        </button>
        <button
          onClick={() => setTab("custom")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            tab === "custom"
              ? "bg-ink text-cream"
              : "bg-card border border-stone-warm text-ink/60"
          }`}
        >
          <Plus className="size-3.5 inline mr-1.5" strokeWidth={2} />
          My Meals ({custom.length})
        </button>
      </div>

      {/* Favorites tab */}
      {tab === "favorites" && (
        <section className="px-6 space-y-3">
          {favBuiltIn.length === 0 && custom.filter((r) => isFav(r.id)).length === 0 && (
            <div className="text-center py-12 text-ink/40">
              <Heart className="size-8 mx-auto mb-3 text-ink/20" strokeWidth={1.5} />
              <p className="text-sm font-medium">No favorites yet</p>
              <p className="text-xs mt-1">Tap the heart on any meal card to save it here.</p>
            </div>
          )}
          {[...favBuiltIn, ...custom.filter((r) => isFav(r.id))].map((recipe) => (
            <RecipeRow
              key={recipe.id}
              recipe={recipe}
              isFav={true}
              isStaple={isStaple(recipe.id)}
              onToggleFav={() => toggleFav(recipe.id)}
              onToggleStaple={() => toggleStaple(recipe.id)}
            />
          ))}
        </section>
      )}

      {/* Custom tab */}
      {tab === "custom" && (
        <section className="px-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-stone-warm text-ink/60 text-sm font-semibold mb-4 flex items-center justify-center gap-2 hover:border-sage hover:text-sage transition-colors"
          >
            <Plus className="size-4" strokeWidth={2} />
            {showForm ? "Cancel" : "Add a recipe"}
          </button>

          {showForm && (
            <AddRecipeForm
              onAdd={(r) => {
                add(r);
                setShowForm(false);
              }}
            />
          )}

          {custom.length === 0 && !showForm && (
            <div className="text-center py-8 text-ink/40">
              <p className="text-sm">No custom recipes yet.</p>
              <p className="text-xs mt-1">Add your go-to meals so they appear in your daily plan.</p>
            </div>
          )}

          <div className="space-y-3">
            {custom.map((recipe) => (
              <RecipeRow
                key={recipe.id}
                recipe={recipe}
                isFav={isFav(recipe.id)}
                isStaple={isStaple(recipe.id)}
                onToggleFav={() => toggleFav(recipe.id)}
                onToggleStaple={() => toggleStaple(recipe.id)}
                onDelete={() => remove(recipe.id)}
              />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

// ─── Recipe Row ─────────────────────────────────────────────────────────────
function RecipeRow({
  recipe,
  isFav,
  isStaple,
  onToggleFav,
  onToggleStaple,
  onDelete,
}: {
  recipe: Recipe;
  isFav: boolean;
  isStaple: boolean;
  onToggleFav: () => void;
  onToggleStaple: () => void;
  onDelete?: () => void;
}) {
  const photo = photoUrl(recipe.id, recipe.mealType, { w: 200, h: 200 });
  const isCustom = recipe.id.startsWith("custom-");

  return (
    <div className="flex gap-3 bg-card border border-stone-warm/50 rounded-xl p-3">
      <img
        src={photo}
        alt={recipe.name}
        className="size-14 rounded-lg object-cover bg-stone-warm/40 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{recipe.name}</p>
        <div className="flex items-center gap-2 text-[11px] text-ink/50 mt-0.5">
          <span className="capitalize">{recipe.mealType}</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>{recipe.prepMinutes}m</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>{recipe.calories} kcal</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={onToggleFav}
            className={`size-7 rounded-lg inline-flex items-center justify-center transition-colors ${
              isFav ? "bg-red-100 text-red-500" : "bg-stone-warm/40 text-ink/30"
            }`}
          >
            <Heart className="size-3.5" strokeWidth={2} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onToggleStaple}
            className={`size-7 rounded-lg inline-flex items-center justify-center transition-colors ${
              isStaple ? "bg-amber-100 text-amber-500" : "bg-stone-warm/40 text-ink/30"
            }`}
            title="Weekly staple"
          >
            <Star className="size-3.5" strokeWidth={2} fill={isStaple ? "currentColor" : "none"} />
          </button>
          {isStaple && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Staple</span>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="size-7 rounded-lg inline-flex items-center justify-center bg-stone-warm/40 text-ink/30 hover:text-red-500 ml-auto transition-colors"
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Recipe Form ────────────────────────────────────────────────────────
function AddRecipeForm({ onAdd }: { onAdd: (r: Recipe) => void }) {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [effort, setEffort] = useState<Effort>("simple");
  const [budget, setBudget] = useState<Budget>("medium");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [tags, setTags] = useState("");
  const [ingredientsList, setIngredientsList] = useState("");
  const [steps, setSteps] = useState("");
  const [warmth, setWarmth] = useState<"warm" | "cool" | "neutral">("neutral");
  const [style, setStyle] = useState<"clean" | "balanced" | "comfort">("balanced");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const submit = () => {
    if (!name.trim()) return;

    const ingredients = ingredientsList
      .split("\n")
      .filter(Boolean)
      .map((line) => ({
        name: line.trim(),
        qtyPerServing: "",
        category: "other" as GroceryCategory,
      }));

    const recipe: Recipe = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      mealType,
      imagePrompt: name,
      prepMinutes,
      effort,
      budget,
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      contains: ingredients.map((i) => i.name.toLowerCase()),
      ingredients,
      steps: steps.split("\n").filter(Boolean),
      calories: calories || 400,
      protein: protein || 25,
      carbs: carbs || 40,
      fats: fats || 15,
      portions: { protein: "1 palm", carbs: "1 fist", veg: "2 fists", fats: "1 thumb" },
      warmth,
      carbDensity: carbs > 50 ? "high" : carbs > 25 ? "medium" : "low",
      style,
    };

    onAdd(recipe);
  };

  return (
    <div className="bg-card border border-stone-warm/50 rounded-2xl p-4 mb-4 space-y-3">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
          Recipe name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Salmon poke bowl"
          className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
            Meal type
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
            Prep time
          </label>
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm">
            <input
              type="number"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(Number(e.target.value) || 0)}
              className="bg-transparent text-sm outline-none w-full min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-ink/45">min</span>
          </div>
        </div>
      </div>

      {/* Macros row */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
          Macros (optional — we'll estimate if blank)
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "kcal", value: calories, set: setCalories },
            { label: "P", value: protein, set: setProtein },
            { label: "C", value: carbs, set: setCarbs },
            { label: "F", value: fats, set: setFats },
          ].map((m) => (
            <div key={m.label} style={{ flex: 1 }}>
              <div className="flex items-center gap-1 px-2 py-2 rounded-lg bg-cream border border-stone-warm">
                <input
                  type="number"
                  value={m.value || ""}
                  placeholder="—"
                  onChange={(e) => m.set(Number(e.target.value) || 0)}
                  className="bg-transparent text-xs outline-none w-full min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-ink/40">{m.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
          Ingredients (one per line)
        </label>
        <textarea
          value={ingredientsList}
          onChange={(e) => setIngredientsList(e.target.value)}
          placeholder={"salmon fillet\nsushi rice\navocado\nsoy sauce"}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none resize-none"
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-ink/50 font-medium"
      >
        {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        Advanced options
      </button>

      {showAdvanced && (
        <div className="space-y-3 pt-1">
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">Effort</label>
              <select value={effort} onChange={(e) => setEffort(e.target.value as Effort)} className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none">
                <option value="nobrain">No-brain</option>
                <option value="simple">Simple</option>
                <option value="proper">Proper</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value as Budget)} className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">Warmth</label>
              <select value={warmth} onChange={(e) => setWarmth(e.target.value as "warm"|"cool"|"neutral")} className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none">
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value as "clean"|"balanced"|"comfort")} className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none">
                <option value="clean">Clean</option>
                <option value="balanced">Balanced</option>
                <option value="comfort">Comfort</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. high-protein, asian, quick"
              className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block mb-1">
              Steps (one per line, optional)
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={"Cook rice\nSlice salmon\nAssemble bowl"}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none resize-none"
            />
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="w-full py-3 rounded-xl bg-sage text-cream text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        Add recipe
      </button>
    </div>
  );
}
