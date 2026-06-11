import { Link } from "@tanstack/react-router";
import { RefreshCw, Clock, Flame, Wallet } from "lucide-react";
import type { Recipe } from "@/lib/types";
import { t } from "@/lib/strings";

const effortLabel = { nobrain: "No-brain", simple: "Simple", proper: "Properly" } as const;
const budgetLabel = { low: "Low", medium: "Med", high: "High" } as const;
const mealLabel = { breakfast: t.today.meals.breakfast, lunch: t.today.meals.lunch, dinner: t.today.meals.dinner };

interface Props {
  recipe: Recipe;
  why: string;
  onSwap: () => void;
  canSwap: boolean;
  showCalories: boolean;
}

export function MealCard({ recipe, why, onSwap, canSwap, showCalories }: Props) {
  return (
    <article className="bg-card rounded-3xl overflow-hidden shadow-sm border border-stone-warm/60">
      <div className="relative">
        <div
          className="w-full aspect-[4/3] grid place-items-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--terracotta) 12%, var(--cream)) 0%, color-mix(in oklab, var(--sage) 15%, var(--cream)) 100%)",
          }}
          aria-label={recipe.imagePrompt}
        >
          <span className="font-serif italic text-2xl text-ink/40 px-6 text-center text-balance">
            {recipe.name}
          </span>
        </div>
        <span className="absolute top-3 left-3 eyebrow bg-cream/90 backdrop-blur px-2.5 py-1 rounded-full text-ink/70">
          {mealLabel[recipe.mealType]}
        </span>
        <span className="absolute top-3 right-3 eyebrow bg-ink/85 text-cream px-2.5 py-1 rounded-full">
          {recipe.prepMinutes} min
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-2xl leading-tight mb-2 text-ink">{recipe.name}</h3>

        <div className="flex items-center gap-3 text-xs text-ink/60 mb-4">
          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" strokeWidth={1.75}/>{recipe.prepMinutes}m</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span className="inline-flex items-center gap-1.5"><Flame className="size-3.5" strokeWidth={1.75}/>{effortLabel[recipe.effort]}</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span className="inline-flex items-center gap-1.5"><Wallet className="size-3.5" strokeWidth={1.75}/>{budgetLabel[recipe.budget]}</span>
        </div>

        <div className="bg-sage-soft border border-sage/15 rounded-2xl p-3 mb-4">
          <span className="eyebrow text-sage block mb-1">{t.today.why}</span>
          <p className="text-sm text-ink/80 leading-relaxed">{why}</p>
        </div>

        {showCalories && (
          <div className="flex items-center gap-3 text-[11px] text-ink/55 mb-4">
            <span><strong className="text-ink/80">{recipe.calories}</strong> kcal</span>
            <span>P {recipe.protein}g</span>
            <span>C {recipe.carbs}g</span>
            <span>F {recipe.fats}g</span>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link
            to="/recipe/$id"
            params={{ id: recipe.id }}
            className="py-3 rounded-2xl bg-ink text-cream text-sm font-semibold text-center active:scale-[0.98] transition-transform"
          >
            {t.today.viewRecipe}
          </Link>
          <button
            type="button"
            onClick={onSwap}
            disabled={!canSwap}
            className="px-4 py-3 rounded-2xl border border-stone-warm bg-card text-ink/80 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-transform"
            aria-label="Swap this meal"
          >
            <RefreshCw className="size-4" strokeWidth={1.75} />
            {t.today.swap}
          </button>
        </div>
      </div>
    </article>
  );
}
