import { Link } from "@tanstack/react-router";
import type { DailyTargets } from "@/lib/nutrition";

interface Props {
  consumed: { kcal: number; protein: number; carbs: number; fats: number };
  targets: DailyTargets;
}

export function DailyOverview({ consumed, targets }: Props) {
  if (!targets.hasData) {
    return (
      <div className="mx-6 mt-8 rounded-2xl bg-card border border-stone-warm/60 p-4">
        <p className="eyebrow text-ink/55 mb-1">Personalize your day</p>
        <p className="text-sm text-ink/70 leading-relaxed">
          Add your age, height and weight in{" "}
          <Link to="/settings" className="text-sage font-semibold underline">
            Settings
          </Link>{" "}
          to see calorie and macro targets tuned to you.
        </p>
      </div>
    );
  }

  const pct = (n: number, d: number) => (d > 0 ? Math.min(100, Math.round((n / d) * 100)) : 0);

  return (
    <section className="mx-6 mt-8 rounded-2xl bg-card border border-stone-warm/60 p-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="eyebrow text-ink/55">Daily overview</p>
        <span className="text-[11px] text-ink/45">
          {consumed.kcal} / {targets.kcal} kcal
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-warm/60 overflow-hidden mb-4">
        <div
          className="h-full bg-sage transition-all"
          style={{ width: `${pct(consumed.kcal, targets.kcal)}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <Macro label="Protein" value={consumed.protein} target={targets.proteinG} color="bg-terracotta" />
        <Macro label="Carbs" value={consumed.carbs} target={targets.carbsG} color="bg-sage" />
        <Macro label="Fats" value={consumed.fats} target={targets.fatsG} color="bg-amber-600" />
      </div>
    </section>
  );
}

function Macro({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink/55">{label}</span>
        <span className="text-[10px] text-ink/55 tabular-nums">
          {value}/{target}g
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-warm/60 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
