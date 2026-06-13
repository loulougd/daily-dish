import { Droplets, Plus, Minus } from "lucide-react";

interface Props {
  glasses: number;
  target: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function HydrationTracker({ glasses, target, onAdd, onRemove }: Props) {
  const pct = Math.min((glasses / target) * 100, 100);
  const done = glasses >= target;

  return (
    <section className="mx-6 mb-6 bg-blue-50/60 border border-blue-200/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets className="size-4 text-blue-500" strokeWidth={2} />
          <span className="text-xs font-semibold text-ink/70">Hydration</span>
        </div>
        <span className="text-xs font-bold text-blue-600 tabular-nums">
          {glasses} / {target} glasses
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: done
              ? "linear-gradient(90deg, #22c55e, #16a34a)"
              : "linear-gradient(90deg, #60a5fa, #3b82f6)",
          }}
        />
      </div>

      {/* Glass dots */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {Array.from({ length: target }, (_, i) => (
          <div
            key={i}
            className={`size-5 rounded-full border-2 transition-colors duration-300 ${
              i < glasses
                ? "bg-blue-500 border-blue-500"
                : "bg-transparent border-blue-200"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRemove}
          disabled={glasses <= 0}
          className="size-9 rounded-xl border border-blue-200 bg-white text-blue-500 inline-flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Minus className="size-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={onAdd}
          className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          <Plus className="size-4 inline mr-1" strokeWidth={2.5} />
          Add a glass
        </button>
      </div>

      {done && (
        <p className="text-[11px] text-green-600 font-semibold mt-2 text-center">
          🎉 Hydration goal reached!
        </p>
      )}
    </section>
  );
}

/** Calculate daily glass target based on weight, training, and weather */
export function calcHydrationTarget(
  weightKg: number,
  training: string,
  tempC: number,
): number {
  // Base: ~30ml per kg → divide by 250ml per glass
  let base = Math.round((weightKg * 30) / 250);
  if (base < 6) base = 6;
  if (base > 16) base = 16;

  // Training bump
  if (training === "intense") base += 3;
  else if (training === "moderate") base += 2;
  else if (training === "light") base += 1;

  // Heat bump
  if (tempC >= 28) base += 2;
  else if (tempC >= 22) base += 1;

  return base;
}
