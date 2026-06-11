import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { planWeek } from "@/lib/meal-planner";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";
import type { GroceryCategory } from "@/lib/types";

export const Route = createFileRoute("/grocery")({
  head: () => ({
    meta: [
      { title: "Grocery list — Forkcast" },
      { name: "description", content: "Your week’s grocery list, grouped by aisle." },
    ],
  }),
  component: GroceryPage,
});

const ORDER: GroceryCategory[] = ["produce", "protein", "dairy", "grains", "pantry", "other"];

function GroceryPage() {
  const { profile, hydrated } = useProfile();
  const grouped = useMemo(() => {
    if (!hydrated) return {} as Record<GroceryCategory, { name: string; uses: number }[]>;
    const week = planWeek(profile);
    const acc: Record<GroceryCategory, Map<string, number>> = {
      produce: new Map(),
      protein: new Map(),
      dairy: new Map(),
      grains: new Map(),
      pantry: new Map(),
      other: new Map(),
    };
    for (const day of week) {
      for (const meal of [day.breakfast, day.lunch, day.dinner]) {
        for (const ing of meal.ingredients) {
          const key = ing.name;
          acc[ing.category].set(key, (acc[ing.category].get(key) ?? 0) + 1);
        }
      }
    }
    const out = {} as Record<GroceryCategory, { name: string; uses: number }[]>;
    for (const k of ORDER) {
      out[k] = Array.from(acc[k].entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, uses]) => ({ name, uses }));
    }
    return out;
  }, [hydrated, profile]);

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="eyebrow text-terracotta mb-2">{t.nav.grocery}</p>
        <h1 className="font-serif text-4xl leading-tight mb-2">{t.grocery.title}</h1>
        <p className="text-sm text-ink/60 leading-relaxed">{t.grocery.sub}</p>
      </header>

      <div className="px-6 space-y-6">
        {ORDER.map((cat) => {
          const items = grouped[cat] ?? [];
          if (!items.length) return null;
          return (
            <section key={cat}>
              <h2 className="eyebrow text-ink/55 mb-2 font-serif normal-case tracking-normal text-base not-italic">
                <span className="eyebrow text-ink/55">{t.grocery.categories[cat]}</span>
              </h2>
              <ul className="bg-card border border-stone-warm rounded-2xl divide-y divide-stone-warm/70 overflow-hidden">
                {items.map((it) => (
                  <li
                    key={it.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-4 rounded border-2 border-stone-warm" />
                      <span className="text-sm text-ink">{it.name}</span>
                    </div>
                    {it.uses > 1 && (
                      <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider">
                        {t.grocery.usedIn(it.uses)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
