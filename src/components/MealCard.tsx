import { Link } from "@tanstack/react-router";
import { RefreshCw, Clock, Flame, Wallet, Sparkles, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Recipe } from "@/lib/types";
import { t } from "@/lib/strings";
import { recipePhotoUrl } from "@/lib/recipe-photos";

const effortLabel = { nobrain: "No-brain", simple: "Simple", proper: "Properly" } as const;
const budgetLabel = { low: "Low", medium: "Med", high: "High" } as const;
const mealLabel = {
  breakfast: t.today.meals.breakfast,
  lunch: t.today.meals.lunch,
  dinner: t.today.meals.dinner,
} as const;

interface Props {
  recipe: Recipe;
  why: string;
  onSwap: () => void;
  canSwap: boolean;
  showCalories: boolean;
  badge?: string;
  feedbackVote?: "up" | "down" | null;
  onFeedback?: (vote: "up" | "down") => void;
  onCooked?: () => void;
  shareSlot?: React.ReactNode;
}

export function MealCard({ recipe, why, onSwap, canSwap, showCalories, badge, feedbackVote, onFeedback, onCooked, shareSlot }: Props) {
  // Fade-out/in animation when the recipe changes via swap
  const [fading, setFading] = useState(false);
  useEffect(() => {
    setFading(true);
    const id = requestAnimationFrame(() => setFading(false));
    return () => cancelAnimationFrame(id);
  }, [recipe.id]);

  const photo = recipePhotoUrl(recipe, { w: 800, h: 450 });
  const label = badge
    ? `${mealLabel[recipe.mealType]} · ${badge}`
    : mealLabel[recipe.mealType];

  return (
    <article
      className={`bg-card rounded-2xl overflow-hidden border border-stone-warm/50 transition-all duration-300 ease-out ${
        fading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative">
        <img
          src={photo}
          alt={recipe.imagePrompt || recipe.name}
          loading="lazy"
          className="w-full aspect-[16/9] object-cover bg-stone-warm/40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/0 to-transparent" />
        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-cream">
          {label}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-cream/95 backdrop-blur px-2 py-1 rounded-full text-ink/80">
          {recipe.prepMinutes} min
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg leading-tight mb-1.5 line-clamp-2 text-ink">
          {recipe.name}
        </h3>

        <div className="flex items-center gap-2.5 text-xs text-ink/55 mb-3">
          <span className="inline-flex items-center gap-1"><Clock className="size-3" strokeWidth={2}/>{recipe.prepMinutes}m</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span className="inline-flex items-center gap-1"><Flame className="size-3" strokeWidth={2}/>{effortLabel[recipe.effort]}</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span className="inline-flex items-center gap-1"><Wallet className="size-3" strokeWidth={2}/>{budgetLabel[recipe.budget]}</span>
        </div>

        <div className="bg-sage-soft/60 rounded-xl p-3 flex gap-2 items-start">
          <Sparkles className="size-3.5 text-sage shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-xs text-ink/70 leading-relaxed line-clamp-2">{why}</p>
        </div>

        {showCalories && (
          <div className="flex items-center gap-3 text-[11px] text-ink/55 mt-3">
            <span><strong className="text-ink/80">{recipe.calories}</strong> kcal</span>
            <span>P {recipe.protein}g</span>
            <span>C {recipe.carbs}g</span>
            <span>F {recipe.fats}g</span>
          </div>
        )}

        {/* Feedback row */}
        {onFeedback && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-ink/40 font-medium">How was it?</span>
            <div className="flex gap-1.5 ml-auto">
              <button
                onClick={() => onFeedback("up")}
                className={`size-8 rounded-lg inline-flex items-center justify-center transition-colors ${
                  feedbackVote === "up"
                    ? "bg-green-100 text-green-600 border border-green-300"
                    : "bg-card text-ink/40 border border-stone-warm hover:text-green-500"
                }`}
                aria-label="Liked"
              >
                <ThumbsUp className="size-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={() => onFeedback("down")}
                className={`size-8 rounded-lg inline-flex items-center justify-center transition-colors ${
                  feedbackVote === "down"
                    ? "bg-red-100 text-red-500 border border-red-300"
                    : "bg-card text-ink/40 border border-stone-warm hover:text-red-400"
                }`}
                aria-label="Disliked"
              >
                <ThumbsDown className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mt-3">
          <Link
            to="/recipe/$id"
            params={{ id: recipe.id }}
            className="py-2.5 rounded-xl bg-ink text-cream text-sm font-semibold text-center active:scale-[0.98] transition-transform"
          >
            {t.today.viewRecipe}
          </Link>
          {onCooked && (
            <button
              type="button"
              onClick={onCooked}
              className="size-10 rounded-xl border border-green-200 bg-green-50 text-green-600 inline-flex items-center justify-center active:scale-[0.95] transition-transform"
              aria-label="Mark as cooked"
            >
              <CheckCircle className="size-4" strokeWidth={2} />
            </button>
          )}
          {shareSlot}
          <button
            type="button"
            onClick={onSwap}
            disabled={!canSwap}
            className="size-10 rounded-xl border border-stone-warm bg-card text-ink/75 inline-flex items-center justify-center disabled:opacity-40 active:scale-[0.95] transition-transform"
            aria-label={t.today.swap}
          >
            <RefreshCw className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}