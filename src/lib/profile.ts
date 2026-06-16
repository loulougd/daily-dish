/**
 * Profile + daily context storage.
 *
 * V1 persists to localStorage so the app works without an account.
 * The shape of `UserProfile` and `DailyContext` is the same shape that will
 * later sync to Supabase tables once Lovable Cloud is enabled:
 *   - profiles            (1 row per user — UserProfile fields)
 *   - daily_contexts      (1 row per user per day — DailyContext fields)
 *   - meal_history        (logged meals: user_id, date, meal_type, recipe_id)
 *   - disliked_meals      (user_id, recipe_id, reason)
 *   - saved_recipes       (user_id, recipe_id, saved_at)
 *   - household_members   (user_id, name, goal, restrictions, hated[])  [future]
 *   - sleep_signals       (user_id, date, quality, source)               [future]
 *
 * Keep all reads/writes in this file so the swap to a Supabase-backed
 * implementation is contained.
 */
import { useEffect, useState, useCallback } from "react";
import type { DailyContext, MealFeedback, UserProfile } from "./types";

const PROFILE_KEY = "forkcast.profile.v1";
const CONTEXT_KEY = "forkcast.context.v1";
const SWAPS_KEY = "forkcast.swaps.v1";
const FEEDBACK_KEY = "forkcast.feedback.v1";
const HYDRATION_KEY = "forkcast.hydration.v1";

export const defaultProfile: UserProfile = {
  goal: "better",
  guidance: "portions",
  time: "t20",
  effort: "simple",
  training: { 1: "moderate", 3: "moderate", 5: "intense" },
  diet: [],
  dietOther: "",
  allergies: [],
  hated: [],
  style: 50,
  budget: "medium",
  household: 2,
  city: "London",
  cycle: { enabled: false, cycleLength: 28 },
  age: 0,
  sex: "na",
  heightCm: 0,
  weightKg: 0,
  targetWeightKg: 0,
  activityLevel: "sedentary",
  onboarded: false,
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(readJSON(PROFILE_KEY, defaultProfile));
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => {
      const next = { ...p, ...patch };
      writeJSON(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    writeJSON(PROFILE_KEY, defaultProfile);
    setProfile(defaultProfile);
  }, []);

  return { profile, update, reset, hydrated };
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export const defaultContext: DailyContext = {
  energy: "normal",
  sleepQuality: "ok",
  timeToday: "t20",
  useUp: [],
  dateISO: todayISO(),
  theme: "",
  symptoms: [],
};

export function useDailyContext(fallbackTime: DailyContext["timeToday"] = "t20") {
  const [ctx, setCtx] = useState<DailyContext>({
    ...defaultContext,
    timeToday: fallbackTime,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readJSON<DailyContext>(CONTEXT_KEY, {
      ...defaultContext,
      timeToday: fallbackTime,
    });
    if (stored.dateISO !== todayISO()) {
      const fresh = { ...defaultContext, timeToday: fallbackTime };
      writeJSON(CONTEXT_KEY, fresh);
      setCtx(fresh);
    } else {
      setCtx(stored);
    }
    setHydrated(true);
  }, [fallbackTime]);

  const update = useCallback((patch: Partial<DailyContext>) => {
    setCtx((c) => {
      const next = { ...c, ...patch, dateISO: todayISO() };
      writeJSON(CONTEXT_KEY, next);
      return next;
    });
  }, []);

  return { context: ctx, update, hydrated };
}

const FREE_SWAPS_PER_DAY = 5;

export function useSwaps() {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    const raw = readJSON<{ date: string; used: number }>(SWAPS_KEY, {
      date: todayISO(),
      used: 0,
    });
    if (raw.date !== todayISO()) {
      const fresh = { date: todayISO(), used: 0 };
      writeJSON(SWAPS_KEY, fresh);
      setUsed(0);
    } else {
      setUsed(raw.used);
    }
  }, []);

  const consume = useCallback(() => {
    setUsed((u) => {
      const next = Math.min(u + 1, FREE_SWAPS_PER_DAY);
      writeJSON(SWAPS_KEY, { date: todayISO(), used: next });
      return next;
    });
  }, []);

  return {
    used,
    remaining: Math.max(FREE_SWAPS_PER_DAY - used, 0),
    canSwap: used < FREE_SWAPS_PER_DAY,
    consume,
  };
}

// ─── Meal Feedback ──────────────────────────────────────────────────────────
export function useMealFeedback() {
  const [feedback, setFeedback] = useState<MealFeedback[]>([]);

  useEffect(() => {
    setFeedback(readJSON<MealFeedback[]>(FEEDBACK_KEY, []));
  }, []);

  const vote = useCallback((recipeId: string, v: "up" | "down") => {
    setFeedback((prev) => {
      // Replace any existing vote for this recipe
      const filtered = prev.filter((f) => f.recipeId !== recipeId);
      const next = [...filtered, { recipeId, vote: v, date: todayISO() }];
      // Keep last 100 entries
      const trimmed = next.slice(-100);
      writeJSON(FEEDBACK_KEY, trimmed);
      return trimmed;
    });
  }, []);

  const getVote = useCallback(
    (recipeId: string): "up" | "down" | null => {
      const entry = feedback.find((f) => f.recipeId === recipeId);
      return entry?.vote ?? null;
    },
    [feedback],
  );

  return { feedback, vote, getVote };
}

/** Get all feedback entries (for scoring engine). */
export function readFeedback(): MealFeedback[] {
  return readJSON<MealFeedback[]>(FEEDBACK_KEY, []);
}

// ─── Hydration Tracker ──────────────────────────────────────────────────────
export function useHydration() {
  const [glasses, setGlasses] = useState(0);

  useEffect(() => {
    const stored = readJSON<{ date: string; glasses: number }>(HYDRATION_KEY, {
      date: todayISO(),
      glasses: 0,
    });
    if (stored.date !== todayISO()) {
      const fresh = { date: todayISO(), glasses: 0 };
      writeJSON(HYDRATION_KEY, fresh);
      setGlasses(0);
    } else {
      setGlasses(stored.glasses);
    }
  }, []);

  const add = useCallback(() => {
    setGlasses((g) => {
      const next = g + 1;
      writeJSON(HYDRATION_KEY, { date: todayISO(), glasses: next });
      return next;
    });
  }, []);

  const remove = useCallback(() => {
    setGlasses((g) => {
      const next = Math.max(0, g - 1);
      writeJSON(HYDRATION_KEY, { date: todayISO(), glasses: next });
      return next;
    });
  }, []);

  return { glasses, add, remove };
}

// ─── Cooking Stats (Gamification) ───────────────────────────────────────────
const STATS_KEY = "forkcast.stats.v1";

export interface CookingStats {
  recipesCooked: string[]; // unique recipe IDs
  totalCooked: number;
  streak: number; // consecutive days
  lastCookDate: string;
}

const defaultStats: CookingStats = {
  recipesCooked: [],
  totalCooked: 0,
  streak: 0,
  lastCookDate: "",
};

export function useCookingStats() {
  const [stats, setStats] = useState<CookingStats>(defaultStats);

  useEffect(() => {
    setStats(readJSON(STATS_KEY, defaultStats));
  }, []);

  const markCooked = useCallback((recipeId: string) => {
    setStats((prev) => {
      const today = todayISO();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString().slice(0, 10);

      let streak = prev.streak;
      if (prev.lastCookDate === yesterdayISO) streak += 1;
      else if (prev.lastCookDate !== today) streak = 1;

      const recipesCooked = prev.recipesCooked.includes(recipeId)
        ? prev.recipesCooked
        : [...prev.recipesCooked, recipeId];

      const next: CookingStats = {
        recipesCooked,
        totalCooked: prev.totalCooked + 1,
        streak,
        lastCookDate: today,
      };
      writeJSON(STATS_KEY, next);
      return next;
    });
  }, []);

  return { stats, markCooked };
}
