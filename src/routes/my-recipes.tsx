import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Flame, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { useCustomRecipes, type CustomRecipeForm } from "@/lib/custom-recipes";
import type { MealType } from "@/lib/types";

export const Route = createFileRoute("/my-recipes")({
  head: () => ({
    meta: [
      { title: "My Recipes - Forkcast" },
      { name: "description", content: "Add personal recipes and weekly staples to your meal planner." },
    ],
  }),
  component: MyRecipesPage,
});

const emptyForm: CustomRecipeForm = {
  name: "",
  mealType: "lunch",
  ingredientsText: "",
  stepsText: "",
  prepMinutes: 20,
  calories: 500,
  protein: 25,
  carbs: 45,
  fats: 18,
  weeklyStaple: false,
};

function MyRecipesPage() {
  const { recipes, addRecipe, removeRecipe, toggleWeeklyStaple } = useCustomRecipes();
  const [form, setForm] = useState<CustomRecipeForm>(emptyForm);
  const [showForm, setShowForm] = useState(recipes.length === 0);

  const stapleCount = useMemo(() => recipes.filter((recipe) => recipe.weeklyStaple).length, [recipes]);

  const updateForm = <K extends keyof CustomRecipeForm>(key: K, value: CustomRecipeForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveRecipe = () => {
    if (!form.name.trim() || !form.ingredientsText.trim()) return;
    addRecipe(form);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="eyebrow text-terracotta mb-2">Personal kitchen</p>
        <h1 className="font-serif text-4xl leading-tight mb-2">My Recipes</h1>
        <p className="text-sm text-ink/60 leading-relaxed text-pretty">
          Add your own meals with ingredients and macros. Weekly staples get a stronger score, so they come back more often.
        </p>
      </header>

      <section className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-stone-warm/70 rounded-2xl p-4">
            <p className="eyebrow text-ink/45 mb-1">Recipes</p>
            <p className="font-serif text-3xl leading-none">{recipes.length}</p>
          </div>
          <div className="bg-card border border-stone-warm/70 rounded-2xl p-4">
            <p className="eyebrow text-ink/45 mb-1">Weekly staples</p>
            <p className="font-serif text-3xl leading-none">{stapleCount}</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-5">
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="w-full py-3 rounded-2xl bg-ink text-cream text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Plus className="size-4" strokeWidth={2} />
          {showForm ? "Hide form" : "Add recipe"}
        </button>
      </section>

      {showForm && (
        <section className="mx-6 mb-6 bg-stone-warm/35 rounded-2xl p-5">
          <div className="space-y-4">
            <Field label="Recipe name">
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="Chicken pesto bowl"
                className="w-full bg-card border border-stone-warm rounded-xl px-3 py-2.5 text-sm font-medium outline-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Meal">
                <select
                  value={form.mealType}
                  onChange={(event) => updateForm("mealType", event.target.value as MealType)}
                  className="w-full bg-card border border-stone-warm rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </Field>
              <Field label="Prep time">
                <NumberInput value={form.prepMinutes} suffix="min" onChange={(value) => updateForm("prepMinutes", value)} />
              </Field>
            </div>

            <Field label="Ingredients">
              <textarea
                value={form.ingredientsText}
                onChange={(event) => updateForm("ingredientsText", event.target.value)}
                rows={5}
                placeholder={"120 g chicken\n80 g rice\n1 handful spinach"}
                className="w-full bg-card border border-stone-warm rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              />
            </Field>

            <Field label="Method">
              <textarea
                value={form.stepsText}
                onChange={(event) => updateForm("stepsText", event.target.value)}
                rows={4}
                placeholder={"Cook the rice.\nGrill the chicken.\nServe with spinach and sauce."}
                className="w-full bg-card border border-stone-warm rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              />
            </Field>

            <div>
              <p className="eyebrow text-ink/55 mb-3">Macros per serving</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="kcal" value={form.calories} onChange={(value) => updateForm("calories", value)} />
                <NumberInput label="Protein" value={form.protein} suffix="g" onChange={(value) => updateForm("protein", value)} />
                <NumberInput label="Carbs" value={form.carbs} suffix="g" onChange={(value) => updateForm("carbs", value)} />
                <NumberInput label="Fats" value={form.fats} suffix="g" onChange={(value) => updateForm("fats", value)} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateForm("weeklyStaple", !form.weeklyStaple)}
              className={`w-full rounded-xl border px-3 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                form.weeklyStaple
                  ? "border-terracotta bg-terracotta-soft text-terracotta"
                  : "border-stone-warm bg-card text-ink/65"
              }`}
            >
              <Star className="size-4" fill={form.weeklyStaple ? "currentColor" : "none"} strokeWidth={2} />
              Weekly staple
            </button>

            <button
              type="button"
              onClick={saveRecipe}
              disabled={!form.name.trim() || !form.ingredientsText.trim()}
              className="w-full py-3.5 rounded-2xl bg-sage text-cream text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              Save recipe
            </button>
          </div>
        </section>
      )}

      <section className="px-6 space-y-3">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 size-12 rounded-2xl bg-sage-soft text-sage grid place-items-center">
              <BookOpen className="size-5" strokeWidth={1.75} />
            </div>
            <p className="font-serif text-2xl mb-1">No personal recipes yet</p>
            <p className="text-sm text-ink/50">Your saved meals will appear here and enter the daily scoring engine.</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <article key={recipe.id} className="bg-card border border-stone-warm/70 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-xl bg-sage-soft text-sage grid place-items-center shrink-0">
                  <Flame className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-terracotta mb-1">{recipe.mealType}</p>
                  <h2 className="font-serif text-2xl leading-tight text-ink">{recipe.name}</h2>
                  <p className="text-xs text-ink/50 mt-1">
                    {recipe.calories} kcal - P{recipe.protein}g - C{recipe.carbs}g - F{recipe.fats}g
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link
                  to="/recipe/$id"
                  params={{ id: recipe.id }}
                  className="flex-1 py-2.5 rounded-xl bg-ink text-cream text-sm font-semibold text-center"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWeeklyStaple(recipe.id)}
                  className={`size-10 rounded-xl border inline-flex items-center justify-center ${
                    recipe.weeklyStaple
                      ? "border-terracotta bg-terracotta-soft text-terracotta"
                      : "border-stone-warm bg-card text-ink/45"
                  }`}
                  aria-label={recipe.weeklyStaple ? "Remove weekly staple" : "Mark weekly staple"}
                >
                  <Star className="size-4" fill={recipe.weeklyStaple ? "currentColor" : "none"} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => removeRecipe(recipe.id)}
                  className="size-10 rounded-xl border border-stone-warm bg-card text-ink/45 inline-flex items-center justify-center"
                  aria-label="Delete recipe"
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow text-ink/55 block mb-2">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  label,
  value,
  suffix,
  onChange,
}: {
  label?: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      {label && <span className="text-[11px] font-semibold text-ink/55 block mb-1">{label}</span>}
      <div className="flex items-center gap-1 bg-card border border-stone-warm rounded-xl px-3 py-2.5">
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="bg-transparent text-sm font-semibold outline-none w-full min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-ink/45">{suffix}</span>}
      </div>
    </label>
  );
}
