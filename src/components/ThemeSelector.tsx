import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

const THEMES = [
  { id: "", label: "No theme", free: true },
  { id: "italian", label: "Italian", free: true },
  { id: "asian", label: "Asian", free: true },
  { id: "mexican", label: "Mexican", free: false },
  { id: "french", label: "French", free: false },
  { id: "indian", label: "Indian", free: false },
  { id: "middleeastern", label: "Middle Eastern", free: false },
  { id: "american", label: "American", free: false },
  { id: "mediterranean", label: "Mediterranean", free: false },
] as const;

interface Props {
  value: string;
  onChange: (theme: string) => void;
}

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <div className="px-6 mb-4">
      <p className="eyebrow text-ink/50 mb-2">Today's cuisine</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {THEMES.map((t) => {
          const active = value === t.id;
          if (!t.free && !active) {
            return (
              <Link
                key={t.id}
                to="/premium"
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-stone-warm/60 bg-card/50 text-ink/35 flex items-center gap-1"
              >
                <Lock className="size-2.5" strokeWidth={2} />
                {t.label}
              </Link>
            );
          }
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? "bg-terracotta-soft border-terracotta text-terracotta"
                  : "bg-card border-stone-warm text-ink/60"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
