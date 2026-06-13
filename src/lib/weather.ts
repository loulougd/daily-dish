import type { Weather } from "./types";

const CACHE_KEY = "forkcast_weather";
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const WMO_MAP: Record<number, string> = {
  0: "Sunny", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy",
  45: "Foggy", 48: "Foggy", 51: "Light drizzle", 53: "Drizzle",
  55: "Heavy drizzle", 56: "Freezing drizzle", 57: "Freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Showers", 81: "Heavy showers", 82: "Violent showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm", 99: "Thunderstorm",
};

function tempToFeel(t: number): Weather["feel"] {
  if (t < 5) return "cold";
  if (t < 12) return "cool";
  if (t < 20) return "mild";
  if (t < 28) return "warm";
  return "hot";
}

interface CachedWeather {
  data: Weather;
  ts: number;
  city: string;
}

function readCache(city: string): Weather | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (cached.city !== city.toLowerCase()) return null;
    if (Date.now() - cached.ts > CACHE_TTL) return null;
    return cached.data;
  } catch { return null; }
}

function writeCache(city: string, data: Weather) {
  try {
    const entry: CachedWeather = { data, ts: Date.now(), city: city.toLowerCase() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {}
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en`
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
    return null;
  } catch { return null; }
}

export async function fetchWeather(city: string): Promise<Weather> {
  const cached = readCache(city);
  if (cached) return cached;

  const coords = await geocodeCity(city);
  if (!coords) return mockWeather(city);

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&timezone=auto`
    );
    const data = await res.json();
    const tempC = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code as number;
    const condition = WMO_MAP[code] ?? "Cloudy";
    const feel = tempToFeel(tempC);
    const weather: Weather = { tempC, condition, feel };
    writeCache(city, weather);
    return weather;
  } catch {
    return mockWeather(city);
  }
}

// Synchronous getter for planner — reads from cache or returns mock
export function getWeather(city: string, _dateISO?: string): Weather {
  const cached = readCache(city);
  if (cached) return cached;
  return mockWeather(city);
}

function mockWeather(city: string): Weather {
  const c = city.toLowerCase();
  let base = 16;
  if (/london|dublin|amsterdam|berlin|paris|brussels/.test(c)) base = 14;
  else if (/lisbon|madrid|barcelona|rome|athens/.test(c)) base = 22;
  else if (/dubai|cairo|bangkok|singapore|mumbai/.test(c)) base = 31;
  else if (/oslo|stockholm|helsinki/.test(c)) base = 8;
  else if (/new york|chicago|toronto/.test(c)) base = 17;
  const month = new Date().getMonth();
  const seasonal = month >= 4 && month <= 8 ? 5 : month >= 10 || month <= 1 ? -4 : 0;
  const tempC = base + seasonal;
  return { tempC, condition: "Partly cloudy", feel: tempToFeel(tempC) };
}
