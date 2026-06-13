import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Flame, RefreshCw, Wallet, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { recipeById, snapshotContext, buildWhyToday, swapMeal } from "@/lib/meal-planner";
import { useDailyContext, useProfile, useSwaps } from "@/lib/profile";
import { t } from "@/lib/strings";
import { photoUrl } from "@/lib/recipe-photos";
import { portionScale, calorieScaleForMeal } from "@/lib/nutrition";

export const Route = createFileRoute("/recipe/$id")({
  head: () => ({
    meta: [
      { title: "Recipe — Forkcast" },
      { name: "description", content: "Recipe details, scaled for your household, with context-aware notes." },
    ],
  }),
  component: RecipePage,
});

const portionColor: Record<string, string> = {
  protein: "text-terracotta",
  carbs: "text-sage",
  veg: "text-ink/60",
  fats: "text-amber-700",
};
const portionLabels = { protein: "Protein", carbs: "Carbs", veg: "Veg", fats: "Fats" };

function RecipePage() {
  const { id } = useParams({ from: "/recipe/$id" });
  const { profile } = useProfile();
  const { context } = useDailyContext(profile.time);
  const swaps = useSwaps();
  const navigate = useNavigate();
  const [currentId, setCurrentId] = useState(id);

  useEffect(() => setCurrentId(id), [id]);

  const recipe = recipeById(currentId);
  const snap = useMemo(() => snapshotContext(profile), [profile]);
  const why = useMemo(
    () => (recipe ? buildWhyToday(recipe, profile, context, snap) : ""),
    [recipe, profile, context, snap],
  );

  if (!recipe) {
    return (
      <div className="min-h-screen bg-cream px-6 pt-16 text-center">
        <p className="text-ink/60 mb-6">Recipe not found.</p>
        <Link to="/today" className="text-sage font-semibold">
          ← Back to today
        </Link>
      </div>
    );
  }

  const scale = Math.max(1, profile.household);
  const showCalories = profile.guidance === "calories";
  const bodyScale = showCalories
    ? calorieScaleForMeal(profile, recipe.calories)
    : portionScale(profile);
  const scalePct = Math.round((bodyScale - 1) * 100);
  const totalScale = scale * bodyScale;

  const handleSwap = () => {
    if (!swaps.canSwap) return;
    const next = swapMeal(recipe.mealType, recipe.id, profile, context);
    if (!next) return;
    swaps.consume();
    navigate({ to: "/recipe/$id", params: { id: next.recipe.id } });
  };

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Hero */}
      <div className="relative">
        <img
          src={photoUrl(recipe.id, recipe.mealType, { w: 1000, h: 800 })}
          alt={recipe.imagePrompt || recipe.name}
          className="aspect-[5/4] w-full object-cover bg-stone-warm/40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/30" />
        <button
          onClick={() => history.back()}
          className="absolute top-5 left-5 size-10 rounded-full bg-cream/95 backdrop-blur grid place-items-center shadow-sm"
          aria-label={t.recipe.back}
        >
          <ArrowLeft className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mx-auto max-w-md px-6 -mt-8">
        <div className="bg-cream rounded-t-[2rem] pt-8">
          <p className="eyebrow text-terracotta mb-2">{recipe.mealType}</p>
          <h1 className="font-serif text-4xl leading-tight mb-3 text-balance">{recipe.name}</h1>

          <div className="flex items-center gap-4 text-xs text-ink/60 mb-5">
            <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5"/>{recipe.prepMinutes} min</span>
            <span className="inline-flex items-center gap-1.5"><Flame className="size-3.5"/>{labelFromEffort(recipe.effort)}</span>
            <span className="inline-flex items-center gap-1.5"><Wallet className="size-3.5"/>{labelFromBudget(recipe.budget)}</span>
          </div>

          <div className="bg-sage-soft border border-sage/15 rounded-2xl p-4 mb-4">
            <span className="eyebrow text-sage block mb-1">{t.today.why}</span>
            <p className="text-sm text-ink/80 leading-relaxed">{why}</p>
          </div>

          {scalePct !== 0 && (
            <div className="mb-6 rounded-2xl bg-terracotta-soft/70 border border-terracotta/15 px-4 py-3 flex items-start gap-2">
              <Sparkles className="size-4 text-terracotta shrink-0 mt-0.5" />
              <p className="text-xs text-ink/75 leading-relaxed">
                {t.recipe.scaleBanner(scalePct)}
              </p>
            </div>
          )}


          {/* Macros or portions */}
          {showCalories ? (
            <section className="mb-8">
              <p className="eyebrow text-ink/55 mb-3">{t.recipe.macros}</p>
              <div className="grid grid-cols-4 gap-2">
                <Stat label="kcal" value={recipe.calories} />
                <Stat label="Protein" value={`${recipe.protein}g`} />
                <Stat label="Carbs" value={`${recipe.carbs}g`} />
                <Stat label="Fats" value={`${recipe.fats}g`} />
              </div>
            </section>
          ) : (
            <section className="mb-8">
              <p className="eyebrow text-ink/55 mb-3">{t.recipe.portionGuide}</p>
              <div className="grid grid-cols-2 gap-3">
                {(["protein", "carbs", "veg", "fats"] as const).map((k) => (
                  <div key={k} className="bg-card border border-stone-warm rounded-2xl p-4">
                    <span className={`eyebrow block mb-1 ${portionColor[k]}`}>
                      {portionLabels[k]}
                    </span>
                    <p className="text-sm font-medium text-ink">{recipe.portions[k]}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ingredients */}
          <section className="mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <p className="eyebrow text-ink/55">{t.recipe.ingredients}</p>
              <span className="text-xs text-ink/45">{t.recipe.forPeople(scale)}</span>
            </div>
            <ul className="bg-card border border-stone-warm rounded-2xl divide-y divide-stone-warm/70 overflow-hidden">
              {recipe.ingredients.map((i) => (
                <li key={i.name} className="flex items-baseline justify-between px-4 py-3">
                  <span className="text-sm text-ink">{i.name}</span>
                  <span className="text-xs font-mono text-ink/60">
                    {scaleQty(i.qtyPerServing, totalScale)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Steps */}
          <section className="mb-10">
            <p className="eyebrow text-ink/55 mb-4">{t.recipe.steps}</p>
            <ol className="space-y-5">
              {recipe.steps.map((s, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="font-serif text-2xl text-terracotta tabular-nums leading-none pt-0.5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-ink/80 leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </section>

          <button
            onClick={handleSwap}
            disabled={!swaps.canSwap}
            className="w-full py-3.5 rounded-2xl border border-stone-warm bg-card text-ink/80 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <RefreshCw className="size-4" /> {t.recipe.swap}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border border-stone-warm rounded-2xl p-3 text-center">
      <div className="font-serif text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-ink/45 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function scaleQty(qty: string, n: number): string {
  if (Math.abs(n - 1) < 0.01) return qty;
  const m = qty.match(/^([\d.,/]+)\s*(.*)$/);
  if (!m) return `${qty} × ${n.toFixed(1)}`;
  const numStr = m[1].replace(",", ".");
  let value: number;
  if (numStr.includes("/")) {
    const [a, b] = numStr.split("/").map(Number);
    value = a / b;
  } else {
    value = Number(numStr);
  }
  if (!isFinite(value)) return `${qty} × ${n.toFixed(1)}`;
  const scaled = value * n;
  const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${rounded} ${m[2]}`.trim();
}

function labelFromEffort(e: string) {
  return e === "nobrain" ? "No-brain" : e === "simple" ? "Simple" : "Properly";
}
function labelFromBudget(b: string) {
  return b === "low" ? "Low budget" : b === "medium" ? "Mid budget" : "Premium";
}
