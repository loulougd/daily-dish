// Curated Unsplash photo IDs for each recipe.
// Format: photo-{id} — we build the full URL via photoUrl().
// To add a new recipe photo, browse unsplash.com, copy the photo ID from its URL.

const PHOTO_MAP: Record<string, string> = {
  // Breakfasts
  b1: "1517673132405-a56a62b18caf", // overnight oats jar
  b2: "1525351484163-7529414344d8", // eggs on toast
  b3: "1610970881699-44a5587cabec", // berry smoothie
  b4: "1612240498936-65f5101365d2", // omelette
  b5: "1571091718767-18b5b1457add", // porridge bowl
  // Lunches
  l1: "1512621776951-a57141f2eefd", // grain bowl
  l2: "1565299585323-38d6b0865b47", // wrap
  l3: "1467003909585-2f8a72700288", // salmon rice bowl
  l4: "1505253716362-afaea1d3d1af", // tuna salad
  l5: "1543353071-10c8ba85a904", // roasted roots bowl
  // Dinners
  d1: "1532550907401-a500c9a57435", // chicken & greens
  d2: "1551183053-bf91a1d81141", // tomato pasta
  d3: "1574484284002-952d92456975", // curry
  d4: "1467003909585-2f8a72700288", // sheet pan salmon
  d5: "1512058564366-18510be2db19", // stir fry
  d6: "1547592180-85f173990554", // lentil soup
};

// Fallbacks per meal type — generic but always reliable Unsplash food photos.
const FALLBACKS: Record<string, string> = {
  breakfast: "1525351484163-7529414344d8",
  lunch: "1512621776951-a57141f2eefd",
  dinner: "1467003909585-2f8a72700288",
  snack: "1610970881699-44a5587cabec",
};

export function photoUrl(
  recipeId: string,
  fallbackType: "breakfast" | "lunch" | "dinner" | "snack" = "lunch",
  opts: { w?: number; h?: number } = {},
): string {
  const id = PHOTO_MAP[recipeId] ?? FALLBACKS[fallbackType];
  const w = opts.w ?? 800;
  const h = opts.h ?? 450;
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`;
}
