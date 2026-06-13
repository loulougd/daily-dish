import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Cloud, Dumbbell, Sparkles, ChevronDown, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { planWeek } from "@/lib/meal-planner";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";
import { phaseLabel } from "@/lib/cycle";
import { photoUrl } from "@/lib/recipe-photos";
import type { Recipe } from "@/lib/types";

export const Route = createFileRoute("/week")({
  head: () => ({
    meta: [
      { title: "Your week — Forkcast" },
      { name: "description", content: "A flexible weekly outline that adapts to your context each day." },
    ],
  }),
  component: WeekPage,
});

function WeekPage() {
  const { profile, hydrated } = useProfile();
  const week = useMemo(() => (hydrated ? planWeek(profile) : []), [hydrated, profile]);
  const [expanded, setExpanded] = useState<number | null>(0); // first day open by default

  const toggle = (idx: number) => {
    setExpanded((prev) => (prev === idx ? null : idx));
  };

  const todayIdx = new Date().getDay();

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="eyebrow text-terracotta mb-2">{t.nav.week}</p>
        <h1 className="font-serif text-4xl leading-tight mb-2">{t.week.title}</h1>
        <p className="text-sm text-ink/60 leading-relaxed text-pretty max-w-[40ch]">
          {t.week.sub}
        </p>
      </header>

      <section className="px-6 space-y-3">
        {week.map((d, idx) => {
          const isToday = d.date.getDay() === todayIdx && idx < 2;
          const isOpen = expanded === idx;

          return (
            <article
              key={idx}
              className={`bg-card border rounded-3xl overflow-hidden transition-all duration-300 ${
                isToday
                  ? "border-terracotta/40 shadow-sm"
                  : "border-stone-warm/70"
              }`}
            >
              {/* Collapsed header — always visible */}
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-12 rounded-2xl grid place-items-center ${
                    isToday ? "bg-terracotta text-cream" : "bg-stone-warm/50"
                  }`}>
                    <div className="text-center">
                      <div className={`text-[10px] font-bold uppercase ${
                        isToday ? "text-cream/80" : "text-ink/50"
                      }`}>
                        {d.dayName}
                      </div>
                      <div className="font-serif text-lg leading-none -mt-0.5">
                        {d.date.getDate()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip Icon={Cloud} label={`${d.snapshot.weather.tempC}°`} />
                      {d.snapshot.training !== "rest" && (
                        <Chip
                          Icon={Dumbbell}
                          label={d.snapshot.training}
                          accent={d.snapshot.training === "intense"}
                        />
                      )}
                      {d.snapshot.cycle && (
                        <Chip Icon={Sparkles} label={phaseLabel(d.snapshot.cycle)} />
                      )}
                    </div>
                    {!isOpen && (
                      <p className="text-[11px] text-ink/45 mt-1 truncate max-w-[200px]">
                        {d.breakfast.name} · {d.lunch.name} · {d.dinner.name}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`size-5 text-ink/40 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.5}
                />
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <ExpandedMeal label="Breakfast" recipe={d.breakfast} />
                  <ExpandedMeal label="Lunch" recipe={d.lunch} />
                  <ExpandedMeal label="Dinner" recipe={d.dinner} />

                  {d.snapshot.training !== "rest" && (
                    <div className="bg-terracotta-soft/50 rounded-xl p-3 text-xs text-ink/60">
                      <span className="font-semibold text-terracotta">Training day</span> — {d.snapshot.training} session.
                      {d.snapshot.training === "intense" ? " Extra carbs and a post-workout snack." : " Balanced energy."}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <div className="mx-6 mt-8 bg-terracotta-soft border border-terracotta/20 rounded-3xl p-5 flex gap-3">
        <CalendarDays className="size-5 text-terracotta shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-ink/80 leading-relaxed">{t.week.premiumHint}</p>
          <Link
            to="/premium"
            className="inline-block mt-2 text-sm font-semibold text-terracotta"
          >
            See Plus →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Chip({
  Icon,
  label,
  accent,
}: {
  Icon: typeof Cloud;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold capitalize ${
        accent ? "bg-terracotta-soft text-terracotta" : "bg-stone-warm/50 text-ink/60"
      }`}
    >
      <Icon className="size-3" strokeWidth={2} />
      {label}
    </span>
  );
}

function ExpandedMeal({ label, recipe }: { label: string; recipe: Recipe }) {
  const photo = photoUrl(recipe.id, recipe.mealType, { w: 400, h: 225 });

  return (
    <Link
      to="/recipe/$id"
      params={{ id: recipe.id }}
      className="flex gap-3 bg-stone-warm/20 rounded-xl p-2.5 hover:bg-stone-warm/40 transition-colors"
    >
      <img
        src={photo}
        alt={recipe.name}
        loading="lazy"
        className="size-16 rounded-lg object-cover shrink-0 bg-stone-warm/40"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-ink truncate">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-ink/50">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="size-3" strokeWidth={2} />
            {recipe.prepMinutes}m
          </span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>{recipe.calories} kcal</span>
          <span className="size-1 rounded-full bg-ink/20" />
          <span>P {recipe.protein}g</span>
        </div>
      </div>
    </Link>
  );
}
