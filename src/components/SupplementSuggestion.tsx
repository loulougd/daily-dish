import { Pill, Lock } from "lucide-react";
import type { CyclePhase, Intensity, SleepQuality, CycleSymptom } from "@/lib/types";

interface Props {
  training: Intensity;
  cycle: CyclePhase | null;
  sleepQuality: SleepQuality;
  symptoms: CycleSymptom[];
  isPremium?: boolean;
}

interface Supplement {
  name: string;
  dose: string;
  reason: string;
  emoji: string;
}

function getSuggestions(props: Props): Supplement[] {
  const { training, cycle, sleepQuality, symptoms } = props;
  const out: Supplement[] = [];

  // Always-on basics
  out.push({
    name: "Magnesium bisglycinate",
    dose: "300–400 mg",
    reason: "Sleep, recovery, cramp prevention",
    emoji: "🧲",
  });

  if (training === "intense" || training === "moderate") {
    out.push({
      name: "Creatine monohydrate",
      dose: "3–5 g",
      reason: "Strength, power, recovery",
      emoji: "💪",
    });
  }

  if (sleepQuality === "rough") {
    out.push({
      name: "Ashwagandha",
      dose: "300 mg",
      reason: "Cortisol, stress, sleep quality",
      emoji: "🌿",
    });
  }

  if (cycle === "menstrual" || symptoms.includes("cramps")) {
    out.push({
      name: "Iron + Vitamin C",
      dose: "18 mg + 100 mg",
      reason: "Replenish iron lost during menstruation",
      emoji: "🩸",
    });
  }

  if (cycle === "luteal" || symptoms.includes("cravings") || symptoms.includes("bloating")) {
    out.push({
      name: "Vitamin B6",
      dose: "50 mg",
      reason: "PMS symptoms, mood, bloating",
      emoji: "🫧",
    });
  }

  if (symptoms.includes("fatigue")) {
    out.push({
      name: "Vitamin D3",
      dose: "2000 IU",
      reason: "Energy, immune function, mood",
      emoji: "☀️",
    });
  }

  if (training === "intense") {
    out.push({
      name: "Omega-3 (EPA/DHA)",
      dose: "1000–2000 mg",
      reason: "Inflammation, joint health, recovery",
      emoji: "🐟",
    });
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return out.filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
}

export function SupplementSuggestion(props: Props) {
  const suggestions = getSuggestions(props);
  const locked = !props.isPremium;

  if (suggestions.length === 0) return null;

  return (
    <section className="mx-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Pill className="size-4 text-sage" strokeWidth={2} />
        <span className="text-xs font-semibold text-ink/70">Today's supplement stack</span>
        {locked && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-terracotta">
            <Lock className="size-3" strokeWidth={2} />
            Plus
          </span>
        )}
      </div>

      <div className={`space-y-2 ${locked ? "opacity-60 pointer-events-none" : ""}`}>
        {suggestions.slice(0, locked ? 2 : suggestions.length).map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-3 bg-sage-soft/40 rounded-xl p-3"
          >
            <span className="text-lg">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink">{s.name}</p>
              <p className="text-[11px] text-ink/55">{s.dose} — {s.reason}</p>
            </div>
          </div>
        ))}
        {locked && suggestions.length > 2 && (
          <a
            href="/premium"
            className="block text-center text-xs font-semibold text-terracotta py-2"
          >
            + {suggestions.length - 2} more with Plus →
          </a>
        )}
      </div>
    </section>
  );
}
