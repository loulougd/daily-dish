import type {
  CyclePhase,
  DailyContext,
  Intensity,
  MealType,
  Recipe,
  UserProfile,
  Weather,
} from "./types";
import { RECIPES } from "./recipes-data";
import { getWeather } from "./weather";
import { getCyclePhase, phaseHint } from "./cycle";
import { countSeasonalMatches } from "./seasonal";
import { readFeedback } from "./profile";

export interface DayContextSnapshot {
  weather: Weather;
  training: Intensity;
  cycle: CyclePhase | null;
}

export function snapshotContext(profile: UserProfile, date = new Date()): DayContextSnapshot {
  const weather = getWeather(profile.city, date.toISOString().slice(0, 10));
  const training = profile.training[date.getDay()] ?? "rest";
  const cycle = getCyclePhase(profile.cycle, date);
  return { weather, training, cycle };
}

// ─── Filters ────────────────────────────────────────────────────────────────
function passesDiet(r: Recipe, profile: UserProfile): boolean {
  const diet = profile.diet.map((d) => d.toLowerCase());
  // Vegan must be tagged vegan
  if (diet.includes("vegan") && !r.tags.includes("vegan")) return false;
  if (diet.includes("vegetarian") && !(r.tags.includes("vegetarian") || r.tags.includes("vegan"))) return false;
  if (
    diet.includes("pescatarian") &&
    !(r.tags.includes("vegetarian") || r.tags.includes("vegan") || r.tags.includes("pescatarian"))
  )
    return false;
  if (diet.includes("gluten-free") && !r.tags.includes("gluten-free")) return false;
  if (diet.includes("nut-free") && !r.tags.includes("nut-free")) return false;
  if (diet.includes("lactose-free")) {
    if (r.ingredients.some((i) => i.category === "dairy")) return false;
  }
  if (diet.includes("halal")) {
    if (r.contains.some((c) => /\b(pork|bacon|ham)\b/.test(c))) return false;
  }
  // free-text "other" simple substring filter
  if (profile.dietOther.trim()) {
    const other = profile.dietOther.toLowerCase();
    const list = other.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    for (const term of list) {
      if (r.contains.some((c) => c.toLowerCase().includes(term))) return false;
      if (r.ingredients.some((i) => i.name.toLowerCase().includes(term))) return false;
    }
  }
  return true;
}

function passesHated(r: Recipe, profile: UserProfile): boolean {
  const hated = profile.hated.map((h) => h.toLowerCase().trim()).filter(Boolean);
  for (const h of hated) {
    if (r.contains.some((c) => c.toLowerCase().includes(h))) return false;
    if (r.ingredients.some((i) => i.name.toLowerCase().includes(h))) return false;
    if (r.name.toLowerCase().includes(h)) return false;
  }
  return true;
}

// ─── Scoring ────────────────────────────────────────────────────────────────
function timeLimitMinutes(t: DailyContext["timeToday"]): number {
  return t === "t10" ? 12 : t === "t20" ? 22 : t === "t45" ? 50 : 120;
}

function scoreRecipe(
  r: Recipe,
  profile: UserProfile,
  ctx: DailyContext,
  snap: DayContextSnapshot,
): number {
  let score = 0;

  // Time fit
  const limit = timeLimitMinutes(ctx.timeToday);
  if (r.prepMinutes <= limit) score += 8;
  else score -= (r.prepMinutes - limit) * 0.5;

  // Effort fit vs energy
  if (ctx.energy === "low" && r.effort === "nobrain") score += 6;
  if (ctx.energy === "low" && r.effort === "proper") score -= 6;
  if (ctx.energy === "motivated" && r.effort === "proper") score += 3;

  // Effort fit vs onboarding preference
  if (r.effort === profile.effort) score += 2;

  // Budget fit (allow lower-cost recipes when profile is lower)
  const bRank = { low: 0, medium: 1, high: 2 } as const;
  if (bRank[r.budget] <= bRank[profile.budget]) score += 2;
  else score -= 3;

  // Weather warmth
  if (snap.weather.feel === "cold" || snap.weather.feel === "cool") {
    if (r.warmth === "warm") score += 4;
    if (r.warmth === "cool") score -= 2;
  } else if (snap.weather.feel === "warm" || snap.weather.feel === "hot") {
    if (r.warmth === "cool") score += 4;
    if (r.warmth === "warm") score -= 1;
  }

  // Training carb-density
  if (snap.training === "intense") {
    if (r.carbDensity === "high") score += 5;
    if (r.carbDensity === "low") score -= 2;
  }
  if (snap.training === "rest") {
    if (r.carbDensity === "low" || r.carbDensity === "medium") score += 1;
  }

  // Goal nudges
  if (profile.goal === "muscle" && r.protein >= 30) score += 3;
  if (profile.goal === "lose" && r.calories <= 480) score += 2;

  // Style preference (0=clean, 50=balanced, 100=comfort)
  const styleScore = profile.style;
  if (styleScore < 35 && r.style === "clean") score += 2;
  else if (styleScore > 65 && r.style === "comfort") score += 2;
  else if (r.style === "balanced") score += 1;

  // Use-up ingredients bonus
  if (ctx.useUp.length) {
    const uses = ctx.useUp
      .map((u) => u.toLowerCase().trim())
      .filter(Boolean);
    for (const u of uses) {
      if (r.contains.some((c) => c.toLowerCase().includes(u))) score += 3;
      if (r.ingredients.some((i) => i.name.toLowerCase().includes(u))) score += 2;
    }
  }

  // Cycle gentle nudges (never restrictive)
  if (snap.cycle === "menstrual" && r.warmth === "warm") score += 1;
  if (snap.cycle === "luteal" && r.carbDensity === "high") score += 1;
  if (snap.cycle === "follicular" && r.style === "clean") score += 1;

  // Theme day cuisine bonus
  if (ctx.theme && ctx.theme.length > 0) {
    if (r.tags.includes(ctx.theme)) score += 10;
  }

  // Seasonal ingredients bonus
  const ingredientNames = r.ingredients.map((i) => i.name);
  const seasonal = countSeasonalMatches(ingredientNames);
  score += Math.min(seasonal.count * 3, 9); // up to +9

  // Sleep quality nudge
  if (ctx.sleepQuality === "rough") {
    // Favour easy, comforting, magnesium-rich tags
    if (r.effort === "nobrain") score += 4;
    if (r.warmth === "warm") score += 2;
    if (r.effort === "proper") score -= 3;
  } else if (ctx.sleepQuality === "great") {
    if (r.effort === "proper") score += 2;
  }

  // Feedback loop: reward recipes the user liked, penalise disliked
  const fb = readFeedback();
  const entry = fb.find((f) => f.recipeId === r.id);
  if (entry) {
    score += entry.vote === "up" ? 3 : -6;
  }

  return score;
}

// ─── Why-this-today reasoning ───────────────────────────────────────────────
export function buildWhyToday(
  r: Recipe,
  profile: UserProfile,
  ctx: DailyContext,
  snap: DayContextSnapshot,
): string {
  const bits: string[] = [];

  if (snap.weather.feel === "cold" && r.warmth === "warm") {
    bits.push(`${snap.weather.tempC}°C outside — a warm, comforting plate`);
  } else if (snap.weather.feel === "cool" && r.warmth === "warm") {
    bits.push(`cool ${snap.weather.tempC}°C — something warming`);
  } else if ((snap.weather.feel === "warm" || snap.weather.feel === "hot") && r.warmth === "cool") {
    bits.push(`warm ${snap.weather.tempC}°C day — keeping it light and fresh`);
  }

  if (snap.training === "intense") {
    bits.push("intense training today — carb-forward to fuel and recover");
  } else if (snap.training === "moderate") {
    bits.push("a training day — balanced energy");
  } else if (snap.training === "rest") {
    bits.push("rest day — protein-led, lighter on carbs");
  }

  if (ctx.energy === "low" && r.effort === "nobrain") {
    bits.push("low energy + minimal cooking");
  } else if (ctx.energy === "motivated" && r.effort === "proper") {
    bits.push("you’re motivated — a slightly more involved cook");
  }

  if (ctx.timeToday === "t10") bits.push("only ~10 minutes available");
  else if (ctx.timeToday === "t20") bits.push("~20 min window");

  const used = ctx.useUp
    .map((u) => u.toLowerCase().trim())
    .filter((u) => u && r.contains.some((c) => c.toLowerCase().includes(u)));
  if (used.length) bits.push(`uses your ${used.join(", ")}`);

  if (profile.goal === "muscle" && r.protein >= 30)
    bits.push(`${r.protein} g protein supports your muscle-building goal`);

  if (snap.cycle) bits.push(`${snap.cycle} phase — ${phaseHint(snap.cycle)}`);

  // Theme day mention
  if (ctx.theme && r.tags.includes(ctx.theme)) {
    bits.push(`fits your ${ctx.theme} theme day`);
  }

  // Seasonal produce mention
  const ingredientNames = r.ingredients.map((i) => i.name);
  const seasonal = countSeasonalMatches(ingredientNames);
  if (seasonal.count >= 2) {
    bits.push(`uses seasonal ${seasonal.matches.slice(0, 2).join(" & ")}`);
  } else if (seasonal.count === 1) {
    bits.push(`features seasonal ${seasonal.matches[0]}`);
  }

  // Sleep quality mention
  if (ctx.sleepQuality === "rough" && r.effort === "nobrain") {
    bits.push("rough sleep — keeping it effortless");
  }

  if (!bits.length) bits.push("a balanced fit for the rest of your day");

  // Cap to a tight sentence
  const sentence = bits.slice(0, 3).join(" • ");
  return sentence[0].toUpperCase() + sentence.slice(1) + ".";
}

// ─── Selection ──────────────────────────────────────────────────────────────
function pickBestForMeal(
  meal: MealType,
  profile: UserProfile,
  ctx: DailyContext,
  snap: DayContextSnapshot,
  excludeIds: Set<string>,
): Recipe | null {
  const candidates = RECIPES.filter(
    (r) =>
      r.mealType === meal &&
      !excludeIds.has(r.id) &&
      passesDiet(r, profile) &&
      passesHated(r, profile),
  );
  if (!candidates.length) {
    // Fallback: relax exclusion only
    const relaxed = RECIPES.filter(
      (r) => r.mealType === meal && passesDiet(r, profile) && passesHated(r, profile),
    );
    if (!relaxed.length) return null;
    return relaxed[0];
  }
  const scored = candidates
    .map((r) => ({ r, s: scoreRecipe(r, profile, ctx, snap) }))
    .sort((a, b) => b.s - a.s);
  // Add tiny randomness among top-3 for swap variety
  const top = scored.slice(0, Math.min(3, scored.length));
  return top[Math.floor(Math.random() * top.length)].r;
}

export interface DayPlan {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snapshot: DayContextSnapshot;
  whys: { breakfast: string; lunch: string; dinner: string };
}

export function planDay(
  profile: UserProfile,
  ctx: DailyContext,
  date = new Date(),
): DayPlan {
  const snap = snapshotContext(profile, date);
  const used = new Set<string>();
  const b = pickBestForMeal("breakfast", profile, ctx, snap, used)!;
  used.add(b.id);
  const l = pickBestForMeal("lunch", profile, ctx, snap, used)!;
  used.add(l.id);
  const d = pickBestForMeal("dinner", profile, ctx, snap, used)!;
  return {
    breakfast: b,
    lunch: l,
    dinner: d,
    snapshot: snap,
    whys: {
      breakfast: buildWhyToday(b, profile, ctx, snap),
      lunch: buildWhyToday(l, profile, ctx, snap),
      dinner: buildWhyToday(d, profile, ctx, snap),
    },
  };
}

export function swapMeal(
  meal: MealType,
  currentId: string,
  profile: UserProfile,
  ctx: DailyContext,
  date = new Date(),
): { recipe: Recipe; why: string } | null {
  const snap = snapshotContext(profile, date);
  const next = pickBestForMeal(meal, profile, ctx, snap, new Set([currentId]));
  if (!next) return null;
  return { recipe: next, why: buildWhyToday(next, profile, ctx, snap) };
}

export function recipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}

// ─── Week outline (simple V1) ───────────────────────────────────────────────
export interface WeekDayPlan {
  date: Date;
  dayName: string;
  snapshot: DayContextSnapshot;
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
}

export function planWeek(profile: UserProfile, start = new Date()): WeekDayPlan[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const out: WeekDayPlan[] = [];
  // Deterministic-ish: use index to mix selection without randomness
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const snap = snapshotContext(profile, d);
    const ctx: DailyContext = {
      energy: "normal",
      sleepQuality: "ok",
      timeToday: profile.time,
      useUp: [],
      dateISO: d.toISOString().slice(0, 10),
      theme: "",
    };
    const used = new Set<string>();
    const candidates = (m: MealType) =>
      RECIPES.filter(
        (r) =>
          r.mealType === m &&
          !used.has(r.id) &&
          passesDiet(r, profile) &&
          passesHated(r, profile),
      );
    const pick = (m: MealType): Recipe => {
      const scored = candidates(m)
        .map((r) => ({ r, s: scoreRecipe(r, profile, ctx, snap) }))
        .sort((a, b) => b.s - a.s);
      const top = scored.slice(0, Math.min(3, scored.length));
      const r = top[i % Math.max(top.length, 1)]?.r ?? scored[0]?.r;
      if (r) used.add(r.id);
      return r;
    };
    out.push({
      date: d,
      dayName: dayNames[d.getDay()],
      snapshot: snap,
      breakfast: pick("breakfast"),
      lunch: pick("lunch"),
      dinner: pick("dinner"),
    });
  }
  return out;
}
