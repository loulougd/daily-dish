import { Moon } from "lucide-react";
import type { SleepQuality } from "@/lib/types";

const OPTIONS: { value: SleepQuality; emoji: string; label: string }[] = [
  { value: "rough", emoji: "😴", label: "Rough" },
  { value: "ok", emoji: "😐", label: "OK" },
  { value: "great", emoji: "😊", label: "Great" },
];

interface Props {
  value: SleepQuality;
  onChange: (v: SleepQuality) => void;
}

export function SleepCheckin({ value, onChange }: Props) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Moon className="size-4 text-ink/50" strokeWidth={1.75} />
        <p className="text-xs font-semibold text-ink/70">How did you sleep?</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              value === opt.value
                ? "bg-ink text-cream shadow-sm"
                : "bg-card text-ink/70 border border-stone-warm"
            }`}
          >
            <span className="text-base block mb-0.5">{opt.emoji}</span>
            {opt.label}
          </button>
        ))}
      </div>
      {value === "rough" && (
        <p className="text-[11px] text-ink/45 mt-2 italic leading-snug">
          Rough night — meals will be easier and more comforting today.
        </p>
      )}
      {value === "great" && (
        <p className="text-[11px] text-ink/45 mt-2 italic leading-snug">
          Well rested — great day for a proper cook if you want one.
        </p>
      )}
    </div>
  );
}
