import { useEffect, useState, useCallback } from "react";
import type { DailyContext, UserProfile } from "./types";

const PROFILE_KEY = "forkcast.profile.v1";
const CONTEXT_KEY = "forkcast.context.v1";
const SWAPS_KEY = "forkcast.swaps.v1";

export const defaultProfile: UserProfile = {
  goal: "better",
  guidance: "portions",
  time: "t20",
  effort: "simple",
  training: { 1: "moderate", 3: "moderate", 5: "intense" },
  diet: [],
  dietOther: "",
  hated: [],
  style: 50,
  budget: "medium",
  household: 2,
  city: "Lisbon",
  cycle: { enabled: false, cycleLength: 28 },
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
  timeToday: "t20",
  useUp: [],
  dateISO: todayISO(),
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
