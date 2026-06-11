import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Cloud, Dumbbell, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { planWeek } from "@/lib/meal-planner";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";
import { phaseLabel } from "@/lib/cycle";

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
        {week.map((d, idx) => (
          <article
            key={idx}
            className="bg-card border border-stone-warm/70 rounded-3xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-stone-warm/50 grid place-items-center">
                  <div className="text-center">
                    <div className="text-[10px] font-bold uppercase text-ink/50">
                      {d.dayName}
                    </div>
                    <div className="font-serif text-lg leading-none -mt-0.5">
                      {d.date.getDate()}
                    </div>
                  </div>
                </div>
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
              </div>
            </div>
            <ul className="space-y-1.5">
              <DayMeal label="B" recipe={d.breakfast} />
              <DayMeal label="L" recipe={d.lunch} />
              <DayMeal label="D" recipe={d.dinner} />
            </ul>
          </article>
        ))}
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

function DayMeal({
  label,
  recipe,
}: {
  label: string;
  recipe: import("@/lib/types").Recipe;
}) {
  return (
    <li>
      <Link
        to="/recipe/$id"
        params={{ id: recipe.id }}
        className="flex items-center gap-3 py-1.5 hover:bg-stone-warm/30 -mx-2 px-2 rounded-lg"
      >
        <span className="size-6 rounded-full bg-sage-soft text-sage text-[10px] font-bold grid place-items-center">
          {label}
        </span>
        <span className="text-sm text-ink/80 flex-1 truncate">{recipe.name}</span>
        <span className="text-[10px] text-ink/40 font-semibold tabular-nums">
          {recipe.prepMinutes}m
        </span>
      </Link>
    </li>
  );
}
