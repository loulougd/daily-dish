import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useDailyContext, useProfile, useSwaps, useMealFeedback, useHydration, useCookingStats } from "@/lib/profile";
import { planDay, swapMeal, snapshotContext } from "@/lib/meal-planner";
import { fetchWeather } from "@/lib/weather";
import { t } from "@/lib/strings";
import { phaseLabel } from "@/lib/cycle";
import { AppShell } from "@/components/AppShell";
import { ContextChip } from "@/components/ContextChip";
import { MealCard } from "@/components/MealCard";
import { SnackCard } from "@/components/SnackCard";
import { ComingSoon } from "@/components/ComingSoon";
import { DailyOverview } from "@/components/DailyOverview";
import { ThemeSelector } from "@/components/ThemeSelector";
import { SleepCheckin } from "@/components/SleepCheckin";
import { HydrationTracker, calcHydrationTarget } from "@/components/HydrationTracker";
import { SupplementSuggestion } from "@/components/SupplementSuggestion";
import { CookingStatsCard } from "@/components/CookingStats";
import { ShareButton } from "@/components/ShareCard";
import { CalendarClock, Users, Recycle, Camera, Wallet } from "lucide-react";
import type { DayPlan } from "@/lib/meal-planner";
import type { EnergyLevel, SleepQuality, TimeBucket, CycleSymptom } from "@/lib/types";
import { calcDailyTargets } from "@/lib/nutrition";

const COMING_SOON = [
  { Icon: CalendarClock, title: "Calendar-aware meals", body: "Connect Google Calendar so packed days pull faster meals, and a late dinner becomes a lighter lunch.", tag: "plus" as const },
  { Icon: Users, title: "Household profiles", body: "One shared meal, personalized portions and swaps per person — different goals, different no-go ingredients.", tag: "plus" as const },
  { Icon: Recycle, title: "Smarter anti-waste", body: "Ingredients chained across the week, leftovers reused on purpose, and an end-of-week rescue recipe.", tag: "plus" as const },
  { Icon: Camera, title: "Restaurant photo → recipe", body: "Snap a dish you loved and get a realistic home version — cheaper, healthier or higher-protein.", tag: "plus" as const },
  { Icon: Wallet, title: "Budget intelligence", body: "Meals tuned to your real weekly spend, with budget-friendly and premium swaps when you want them.", tag: "soon" as const },
];

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
  const { context, update: updateCtx, hydrated: ctxHydrated } = useDailyContext(profile.time);
  const swaps = useSwaps();
  const { feedback, vote: voteFeedback, getVote } = useMealFeedback();
  const hydration = useHydration();
  const { stats: cookingStats, markCooked } = useCookingStats();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [useUpDraft, setUseUpDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Fetch real weather on mount (caches for 2h)
  useEffect(() => {
    if (!profile.city) return;
    fetchWeather(profile.city).catch(() => {});
  }, [profile.city]);

  useEffect(() => {
    if (!hydrated || !ctxHydrated) return;
    setPlan(planDay(profile, context));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, ctxHydrated, context.energy, context.sleepQuality, context.timeToday, context.theme, context.useUp.join(","), (context.symptoms ?? []).join(","), profile.onboarded, feedback.length]);

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
  const trainingToday = snap.training;
  const targets = calcDailyTargets(profile, trainingToday);
  const consumed = {
    kcal: plan.breakfast.calories + plan.lunch.calories + plan.dinner.calories,
    protein: plan.breakfast.protein + plan.lunch.protein + plan.dinner.protein,
    carbs: plan.breakfast.carbs + plan.lunch.carbs + plan.dinner.carbs,
    fats: plan.breakfast.fats + plan.lunch.fats + plan.dinner.fats,
  };

  const onSwap = (meal: "breakfast" | "lunch" | "dinner") => {
    if (!swaps.canSwap) return;
    const current = plan[meal];
    const next = swapMeal(meal, current.id, profile, context);
    if (!next) {
      setNotice(t.today.noAlternative);
      setTimeout(() => setNotice(null), 2500);
      return;
    }
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

  const showSnack = trainingToday !== "rest";
  const snackBadge =
    trainingToday === "intense" || trainingToday === "moderate"
      ? "PRE-TRAINING"
      : "POST-TRAINING";

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

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 pb-5">
        <ContextChip label={t.today.contextLabels.weather} value={`${snap.weather.tempC}°C ${snap.weather.condition}`} />
        <ContextChip
          label={t.today.contextLabels.training}
          value={snap.training === "rest" ? "Rest day" : capitalize(snap.training)}
          accent={snap.training === "intense"}
        />
        {snap.cycle && <ContextChip label={t.today.contextLabels.cycle} value={phaseLabel(snap.cycle)} />}
        <ContextChip label={t.today.contextLabels.time} value={timeBucketLabel(context.timeToday)} />
        <ContextChip label={t.today.contextLabels.energy} value={energyLabel(context.energy)} />
        <ContextChip label="Sleep" value={sleepLabel(context.sleepQuality)} />
      </div>

      <ThemeSelector
        value={context.theme}
        onChange={(theme) => updateCtx({ theme })}
      />

      <section className="mx-6 mb-6 bg-stone-warm/40 rounded-2xl p-5">
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

        <SleepCheckin
          value={context.sleepQuality}
          onChange={(sq) => updateCtx({ sleepQuality: sq })}
        />

        {/* Cycle symptoms — only when cycle tracking enabled */}
        {profile.cycle.enabled && snap.cycle && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-ink/70 mb-2.5">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2">
              {(["cramps", "bloating", "fatigue", "cravings", "headache"] as CycleSymptom[]).map((s) => {
                const active = (context.symptoms ?? []).includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => {
                      const current = context.symptoms ?? [];
                      const next = active ? current.filter((x) => x !== s) : [...current, s];
                      updateCtx({ symptoms: next });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                      active
                        ? "bg-terracotta text-cream border-terracotta"
                        : "bg-card text-ink/60 border-stone-warm"
                    }`}
                  >
                    {s === "cramps" ? "🩹 Cramps" : s === "bloating" ? "🫧 Bloating" : s === "fatigue" ? "😮‍💨 Fatigue" : s === "cravings" ? "🍫 Cravings" : "🤕 Headache"}
                  </button>
                );
              })}
            </div>
            {(context.symptoms ?? []).length > 0 && (
              <p className="text-[11px] text-ink/45 mt-2 italic">
                Meals adjusted — lighter, easier, or more comforting.
              </p>
            )}
          </div>
        )}

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
                onClick={() => updateCtx({ useUp: context.useUp.filter((x) => x !== u) })}
                className="px-2.5 py-1 rounded-full bg-terracotta-soft text-terracotta text-xs font-semibold"
              >
                {u} ×
              </button>
            ))}
          </div>
        )}
      </section>

      <HydrationTracker
        glasses={hydration.glasses}
        target={calcHydrationTarget(
          profile.weightKg || 65,
          snap.training,
          snap.weather.tempC,
        )}
        onAdd={hydration.add}
        onRemove={hydration.remove}
      />

      <SupplementSuggestion
        training={snap.training}
        cycle={snap.cycle}
        sleepQuality={context.sleepQuality}
        symptoms={context.symptoms ?? []}
        isPremium={false}
      />

      <section className="px-6 space-y-4">
        <MealCard
          recipe={plan.breakfast}
          why={plan.whys.breakfast}
          onSwap={() => onSwap("breakfast")}
          canSwap={swaps.canSwap}
          showCalories={profile.guidance === "calories"}
          feedbackVote={getVote(plan.breakfast.id)}
          onFeedback={(v) => voteFeedback(plan.breakfast.id, v)}
          onCooked={() => markCooked(plan.breakfast.id)}
          shareSlot={<ShareButton recipe={plan.breakfast} weather={snap.weather} city={profile.city} why={plan.whys.breakfast} />}
        />
        <MealCard
          recipe={plan.lunch}
          why={plan.whys.lunch}
          onSwap={() => onSwap("lunch")}
          canSwap={swaps.canSwap}
          showCalories={profile.guidance === "calories"}
          feedbackVote={getVote(plan.lunch.id)}
          onFeedback={(v) => voteFeedback(plan.lunch.id, v)}
          onCooked={() => markCooked(plan.lunch.id)}
          shareSlot={<ShareButton recipe={plan.lunch} weather={snap.weather} city={profile.city} why={plan.whys.lunch} />}
        />
        {showSnack && (
          <SnackCard
            label={snackBadge === "PRE-TRAINING" ? t.today.snack.labelPre : t.today.snack.labelPost}
            name={snackBadge === "PRE-TRAINING" ? "Banana + nut butter" : "Greek yogurt + honey"}
            note={
              snackBadge === "PRE-TRAINING"
                ? "Quick carbs ~45 min before training to fuel the session."
                : "Protein + carbs within an hour to kick off recovery."
            }
          />
        )}
        <MealCard
          recipe={plan.dinner}
          why={plan.whys.dinner}
          onSwap={() => onSwap("dinner")}
          canSwap={swaps.canSwap}
          showCalories={profile.guidance === "calories"}
          feedbackVote={getVote(plan.dinner.id)}
          onFeedback={(v) => voteFeedback(plan.dinner.id, v)}
          onCooked={() => markCooked(plan.dinner.id)}
          shareSlot={<ShareButton recipe={plan.dinner} weather={snap.weather} city={profile.city} why={plan.whys.dinner} />}
        />
      </section>

      <div className="px-6 mt-5 text-center text-xs text-ink/50">
        {notice ? (
          <span className="text-terracotta font-semibold">{notice}</span>
        ) : swaps.canSwap ? (
          t.today.swapsLeft(swaps.remaining)
        ) : (
          <a href="/premium" className="text-terracotta font-semibold underline">
            {t.today.upgradeForUnlimited}
          </a>
        )}
      </div>

      {profile.guidance === "calories" && (
        <DailyOverview consumed={consumed} targets={targets} />
      )}

      <CookingStatsCard stats={cookingStats} />

      <ComingSoon items={COMING_SOON} />
    </AppShell>
  );
}

function buildHeadline(
  snap: ReturnType<typeof snapshotContext>,
  ctx: { energy: EnergyLevel; timeToday: TimeBucket },
  city: string,
): { title: string; body: string } {
  const dayName = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  let title = `It’s a ${snap.weather.feel} ${dayName}.`;
  if (snap.training === "intense") title = `A big training ${dayName}.`;
  else if (ctx.energy === "low") title = `Taking it easy this ${dayName}.`;

  const parts: string[] = [`${snap.weather.tempC}°C in ${city}`];
  if (snap.training !== "rest") parts.push(`${snap.training} session ahead`);
  if (ctx.energy === "low") parts.push("low energy — quick meals");
  else if (ctx.energy === "motivated") parts.push("you’re motivated — a real cook is on the table");
  const body = `Here’s what fits today: ${parts.join(", ")}.`;
  return { title, body };
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
function energyLabel(e: EnergyLevel) {
  return e === "low" ? "Low" : e === "normal" ? "Normal" : "Motivated";
}
function sleepLabel(s: SleepQuality) {
  return s === "rough" ? "Rough" : s === "ok" ? "OK" : "Great";
}
function timeBucketLabel(tb: TimeBucket) {
  return tb === "t10" ? "10 min" : tb === "t20" ? "20 min" : tb === "t45" ? "45 min" : "Prep";
}
