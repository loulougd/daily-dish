import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { Check, ChevronDown, ChevronRight, ClipboardCopy, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { planWeek } from "@/lib/meal-planner";
import { useProfile } from "@/lib/profile";
import { useExternalRecipeCatalog } from "@/lib/external-recipes";
import { t } from "@/lib/strings";
import type { GroceryCategory } from "@/lib/types";

export const Route = createFileRoute("/grocery")({
  head: () => ({
    meta: [
      { title: "Grocery list — Forkcast" },
      { name: "description", content: "Your week's grocery list, grouped by aisle." },
    ],
  }),
  component: GroceryPage,
});

const ORDER: GroceryCategory[] = ["produce", "protein", "dairy", "grains", "pantry", "other"];
const CAT_ICONS: Record<GroceryCategory, string> = {
  produce: "🥬", protein: "🥩", dairy: "🧀", grains: "🌾", pantry: "🫙", other: "📦",
};

interface GroceryItem {
  name: string;
  qty: string;
  uses: number;
}

function GroceryPage() {
  const { profile, hydrated } = useProfile();
  const externalCatalog = useExternalRecipeCatalog(profile);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<GroceryCategory>>(new Set());

  const grouped = useMemo(() => {
    if (!hydrated || !externalCatalog.hydrated) return {} as Record<GroceryCategory, GroceryItem[]>;
    const week = planWeek(profile);
    const acc: Record<GroceryCategory, Map<string, { qty: string; uses: number }>> = {
      produce: new Map(), protein: new Map(), dairy: new Map(),
      grains: new Map(), pantry: new Map(), other: new Map(),
    };
    for (const day of week) {
      for (const meal of [day.breakfast, day.lunch, day.dinner]) {
        for (const ing of meal.ingredients) {
          const key = ing.name;
          const existing = acc[ing.category].get(key);
          if (existing) {
            existing.uses += 1;
          } else {
            acc[ing.category].set(key, { qty: scaleQty(ing.qtyPerServing, profile.household), uses: 1 });
          }
        }
      }
    }
    const out = {} as Record<GroceryCategory, GroceryItem[]>;
    for (const k of ORDER) {
      out[k] = Array.from(acc[k].entries())
        .sort((a, b) => b[1].uses - a[1].uses)
        .map(([name, v]) => ({ name, qty: v.qty, uses: v.uses }));
    }
    return out;
  }, [hydrated, externalCatalog.hydrated, externalCatalog.recipes.length, profile]);

  const totalItems = useMemo(
    () => ORDER.reduce((sum, cat) => sum + (grouped[cat]?.length ?? 0), 0),
    [grouped],
  );

  const toggle = useCallback((name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((cat: GroceryCategory) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const copyToClipboard = useCallback(() => {
    const lines: string[] = [];
    for (const cat of ORDER) {
      const items = grouped[cat] ?? [];
      if (!items.length) continue;
      lines.push(`\n${t.grocery.categories[cat].toUpperCase()}`);
      for (const it of items) {
        const mark = checked.has(it.name) ? "✓" : "○";
        lines.push(`${mark} ${it.name} — ${it.qty}${it.uses > 1 ? ` (×${it.uses} meals)` : ""}`);
      }
    }
    navigator.clipboard?.writeText(lines.join("\n"));
  }, [grouped, checked]);

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-4">
        <p className="eyebrow text-terracotta mb-2">{t.nav.grocery}</p>
        <h1 className="font-serif text-4xl leading-tight mb-2">{t.grocery.title}</h1>
        <p className="text-sm text-ink/60 leading-relaxed">{t.grocery.sub}</p>
      </header>

      <div className="px-6 flex gap-2 mb-5">
        <button
          onClick={copyToClipboard}
          className="flex-1 py-2.5 rounded-xl border border-stone-warm bg-card text-sm font-semibold text-ink/70 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <ClipboardCopy className="size-3.5" strokeWidth={2} />
          Copy list
        </button>
        {checked.size > 0 && (
          <button
            onClick={() => setChecked(new Set())}
            className="px-4 py-2.5 rounded-xl border border-stone-warm bg-card text-sm font-semibold text-ink/50 flex items-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Trash2 className="size-3.5" strokeWidth={2} />
            Clear
          </button>
        )}
      </div>

      <div className="px-6 space-y-4">
        {ORDER.map((cat) => {
          const items = grouped[cat] ?? [];
          if (!items.length) return null;
          const isCollapsed = collapsed.has(cat);
          const checkedInCat = items.filter((i) => checked.has(i.name)).length;
          return (
            <section key={cat}>
              <button
                onClick={() => toggleCollapse(cat)}
                className="flex items-center gap-2 w-full mb-2"
              >
                {isCollapsed
                  ? <ChevronRight className="size-4 text-ink/40" strokeWidth={2} />
                  : <ChevronDown className="size-4 text-ink/40" strokeWidth={2} />}
                <span className="text-sm font-semibold text-ink/70">{CAT_ICONS[cat]} {t.grocery.categories[cat]}</span>
                <span className="text-[10px] text-ink/40 font-semibold ml-auto">
                  {checkedInCat}/{items.length}
                </span>
              </button>
              {!isCollapsed && (
                <ul className="bg-card border border-stone-warm/60 rounded-2xl divide-y divide-stone-warm/50 overflow-hidden">
                  {items.map((it) => {
                    const done = checked.has(it.name);
                    return (
                      <li key={it.name}>
                        <button
                          onClick={() => toggle(it.name)}
                          className="flex items-center w-full px-4 py-3 gap-3 text-left"
                        >
                          <span
                            className={`size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              done
                                ? "bg-sage border-sage"
                                : "border-stone-warm"
                            }`}
                          >
                            {done && <Check className="size-3 text-cream" strokeWidth={3} />}
                          </span>
                          <span
                            className={`text-sm flex-1 transition-colors ${
                              done ? "line-through text-ink/35" : "text-ink"
                            }`}
                          >
                            {it.name}
                          </span>
                          <span className={`text-xs shrink-0 ${done ? "text-ink/25" : "text-ink/45"}`}>
                            {it.qty}
                          </span>
                          {it.uses > 1 && (
                            <span className="text-[9px] text-terracotta font-bold uppercase tracking-wider shrink-0">
                              ×{it.uses}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="px-6 mt-6 mb-4 text-center">
        <p className="text-xs text-ink/40">
          {totalItems} items · scaled for {profile.household} {profile.household === 1 ? "person" : "people"}
        </p>
      </div>
    </AppShell>
  );
}

function scaleQty(qty: string, household: number): string {
  const match = qty.match(/^([\d.]+)\s*(.*)/);
  if (!match) return `${qty} ×${household}`;
  const num = parseFloat(match[1]) * household;
  const unit = match[2];
  const rounded = num % 1 === 0 ? num.toString() : num.toFixed(1);
  return `${rounded} ${unit}`.trim();
}
