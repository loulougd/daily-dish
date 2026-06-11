import type { Weather } from "./types";

// Mock weather. Deterministic per-city + per-day so the dashboard feels stable.
// Structured to be swapped for a real OpenWeather call later.
export function getWeather(city: string, dateISO = new Date().toISOString().slice(0, 10)): Weather {
  const seed = hash(`${city.toLowerCase()}::${dateISO}`);
  const base = seedTempForCity(city);
  const variance = (seed % 9) - 4; // -4..+4
  const tempC = Math.round(base + variance);

  const conditions = ["Clear", "Sunny", "Partly cloudy", "Cloudy", "Overcast", "Light rain"];
  const condition = conditions[seed % conditions.length];

  let feel: Weather["feel"];
  if (tempC <= 6) feel = "cold";
  else if (tempC <= 14) feel = "cool";
  else if (tempC <= 22) feel = "mild";
  else if (tempC <= 28) feel = "warm";
  else feel = "hot";

  return { tempC, condition, feel };
}

function seedTempForCity(city: string) {
  const c = city.toLowerCase();
  if (/oslo|stockholm|helsinki|reykjavik/.test(c)) return 4;
  if (/london|dublin|amsterdam|berlin|paris|brussels/.test(c)) return 12;
  if (/lisbon|madrid|barcelona|rome|athens/.test(c)) return 19;
  if (/dubai|cairo|bangkok|singapore|mumbai/.test(c)) return 30;
  if (/new york|chicago|toronto|montreal/.test(c)) return 14;
  if (/los angeles|san francisco|miami|austin/.test(c)) return 22;
  return 16;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
