import type { CyclePhase, CycleSettings } from "./types";

export function getCyclePhase(
  settings: CycleSettings,
  date = new Date(),
): CyclePhase | null {
  if (!settings.enabled || !settings.lastPeriodISO) return null;
  const last = new Date(settings.lastPeriodISO + "T00:00:00");
  const length = Math.max(20, Math.min(40, settings.cycleLength || 28));
  const diff = Math.floor((date.getTime() - last.getTime()) / 86400000);
  if (diff < 0) return null;
  const day = (diff % length) + 1;
  if (day <= 5) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulation";
  return "luteal";
}

export function phaseLabel(p: CyclePhase): string {
  return p[0].toUpperCase() + p.slice(1);
}

export function phaseHint(p: CyclePhase): string {
  switch (p) {
    case "menstrual":
      return "iron-rich, warming, comforting foods";
    case "follicular":
      return "fresh, light, energizing meals";
    case "ovulation":
      return "antioxidant-rich, colorful plates";
    case "luteal":
      return "magnesium-rich, satisfying carbs";
  }
}
