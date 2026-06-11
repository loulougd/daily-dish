import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useDailyContext, useProfile, useSwaps } from "@/lib/profile";
import { planDay, swapMeal } from "@/lib/meal-planner";
import { t } from "@/lib/strings";
import { phaseLabel } from "@/lib/cycle";
import { AppShell } from "@/components/AppShell";
import { ContextChip } from "@/components/ContextChip";
import { MealCard } from "@/components/MealCard";
import type { DayPlan } from "@/lib/meal-planner";
import type { EnergyLevel, TimeBucket } from "@/lib/types";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Today — Forkcast" },
      { name: "description", content: "Today’s three meals, adapted to your context." },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const { profile, hydrated } = useProfile();
  const { context, update: updateCtx, hydrated: ctxHydrated } = useDailyContext(
    profile.time,
  );
  const swaps = useSwaps();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [useUpDraft, setUseUpDraft] = useState("");

  // Build the plan once the user + ctx hydrate; rebuild when context inputs change
  useEffect(() => {
    if (!hydrated || !ctxHydrated) return;
    setPlan(planDay(profile, context));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hydrated,
    ctxHydrated,
    context.energy,
    context.timeToday,
    context.useUp.join(","),
    profile.onboarded,
  ]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t.today.greetMorning;
    if (h < 18) return t.today.greetAfternoon;
    return t.today.greetEvening;
  }, []);

  if (hydrated && !profile.onboarded) return <Navigate to="/onboarding" replace />;
  if (!plan) {
    return (
      <AppShell>
        <div className="px-6 pt-16 text-ink/50 font-serif italic text-2xl">
          Preparing your day…
        </div>
      </AppShell>
    );
  }

  const { snapshot: snap } = plan;
  const headlineSentence = buildHeadline(snap, context, profile.city);

  const onSwap = (meal: "breakfast" | "lunch" | "dinner") => {
    if (!swaps.canSwap) return;
    const current = plan[meal];
    const next = swapMeal(meal, current.id, profile, context);
    if (!next) return;
    swaps.consume();
    setPlan({
      ...plan,
      [meal]: next.recipe,
      whys: { ...plan.whys, [meal]: next.why },
    });
  };

  const addUseUp = () => {
    const v = useUpDraft.trim();
    if (!v) return;
    if (context.useUp.includes(v.toLowerCase())) {
      setUseUpDraft("");
      return;
    }
    updateCtx({ useUp: [...context.useUp, v.toLowerCase()] });
    setUseUpDraft("");
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="text-terracotta font-semibold text-xs uppercase tracking-widest mb-1">
          {greeting}
        </p>
        <h1 className="font-serif text-[2.1rem] leading-[1.05] text-balance">
          {headlineSentence.title}
        </h1>
        <p className="text-ink/60 text-sm mt-3 italic leading-relaxed text-pretty max-w-[40ch]">
          {headlineSentence.body}
        </p>
      </header>

      {/* Context bar */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 pb-5">
        <ContextChip
          label={t.today.contextLabels.weather}
          value={`${snap.weather.tempC}°C ${snap.weather.condition}`}
        />
        <ContextChip
          label={t.today.contextLabels.training}
          value={snap.training === "rest" ? "Rest day" : capitalize(snap.training)}
          accent={snap.training === "intense"}
        />
        {snap.cycle && (
          <ContextChip
            label={t.today.contextLabels.cycle}
            value={phaseLabel(snap.cycle)}
          />
        )}
        <ContextChip
          label={t.today.contextLabels.time}
          value={timeBucketLabel(context.timeToday)}
        />
        <ContextChip
          label={t.today.contextLabels.energy}
          value={energyLabel(context.energy)}
        />
      </div>

      {/* Check-in */}
      <section className="mx-6 mb-6 bg-stone-warm/40 rounded-3xl p-5">
        <p className="eyebrow text-ink/55 mb-3">{t.today.checkin}</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(["low", "normal", "motivated"] as EnergyLevel[]).map((e) => (
            <button
              key={e}
              onClick={() => updateCtx({ energy: e })}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                context.energy === e
                  ? "bg-sage text-cream shadow-sm"
                  : "bg-card text-ink/70 border border-stone-warm"
              }`}
            >
              {e === "low" ? "Low" : e === "normal" ? "Normal" : "Motivated"}
            </button>
          ))}
        </div>

        <p className="eyebrow text-ink/55 mb-3">{t.today.timeToday}</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {(["t10", "t20", "t45", "prep"] as TimeBucket[]).map((tb) => (
            <button
              key={tb}
              onClick={() => updateCtx({ timeToday: tb })}
              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                context.timeToday === tb
                  ? "bg-sage text-cream shadow-sm"
                  : "bg-card text-ink/70 border border-stone-warm"
              }`}
            >
              {tb === "t10" ? "10m" : tb === "t20" ? "20m" : tb === "t45" ? "45m" : "Prep"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-card/70 px-3 py-2 rounded-xl border border-stone-warm/70">
          <span className="text-xs text-ink/55 font-medium shrink-0">{t.today.useUp}</span>
          <input
            type="text"
            value={useUpDraft}
            onChange={(e) => setUseUpDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUseUp();
              }
            }}
            placeholder={t.today.useUpPlaceholder}
            className="bg-transparent text-sm outline-none flex-1 placeholder:text-ink/35 font-medium"
          />
        </div>
        {context.useUp.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {context.useUp.map((u) => (
              <button
                key={u}
                onClick={() =>
                  updateCtx({ useUp: context.useUp.filter((x) => x !== u) })
                }
                className="px-2.5 py-1 rounded-full bg-terracotta-soft text-terracotta text-xs font-semibold"
              >
                {u} ×
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Meal cards */}
      <section className="px-6 space-y-5">
        {(["breakfast", "lunch", "dinner"] as const).map((m) => (
          <MealCard
            key={m}
            recipe={plan[m]}
            why={plan.whys[m]}
            onSwap={() => onSwap(m)}
            canSwap={swaps.canSwap}
            showCalories={profile.guidance === "calories"}
          />
        ))}
      </section>

      <div className="px-6 mt-6 text-center text-xs text-ink/50">
        {swaps.canSwap ? (
          t.today.swapsLeft(swaps.remaining)
        ) : (
          <a href="/premium" className="text-terracotta font-semibold underline">
            {t.today.upgradeForUnlimited}
          </a>
        )}
      </div>
    </AppShell>
  );
}

function buildHeadline(
  snap: ReturnType<typeof import("@/lib/meal-planner").snapshotContext>,
  ctx: { energy: EnergyLevel; timeToday: TimeBucket },
  city: string,
): { title: string; body: string } {
  const dayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  let title = `It’s a ${snap.weather.feel} ${dayName}.`;
  if (snap.training === "intense") title = `A big training ${dayName}.`;
  else if (ctx.energy === "low") title = `Taking it easy this ${dayName}.`;

  const parts: string[] = [`${snap.weather.tempC}°C in ${city}`];
  if (snap.training !== "rest") parts.push(`${snap.training} session ahead`);
  if (ctx.energy === "low") parts.push("low energy — quick meals");
  else if (ctx.energy === "motivated") parts.push("you’re motivated — a real cook is on the table");
  const body = `Building a menu around ${parts.join(", ")}.`;
  return { title, body };
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
function energyLabel(e: EnergyLevel) {
  return e === "low" ? "Low" : e === "normal" ? "Normal" : "Motivated";
}
function timeBucketLabel(t: TimeBucket) {
  return t === "t10" ? "10 min" : t === "t20" ? "20 min" : t === "t45" ? "45 min" : "Prep";
}
