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
  b6: "1565958011703-44f9829ba187", // ricotta toast figs
  b7: "1600891964092-4316c288032e", // huevos rancheros
  b8: "1590412200988-a436970781fa", // shakshuka
  b9: "1484723091739-30a097e8f929", // french toast berries
  b10: "1567620905732-2d1ec7ab7445", // banana pancakes
  b11: "1495214783159-3503fd1f5e34", // chia pudding
  // Lunches
  l1: "1512621776951-a57141f2eefd", // grain bowl
  l2: "1565299585323-38d6b0865b47", // wrap
  l3: "1467003909585-2f8a72700288", // salmon rice bowl
  l4: "1505253716362-afaea1d3d1af", // tuna salad
  l5: "1543353071-10c8ba85a904", // roasted roots bowl
  l6: "1473093295043-cdd0b0903d51", // pesto penne
  l7: "1543339308-a3d42e36da7b", // burrito bowl
  l8: "1580476262798-bddd9f4b7369", // teriyaki salmon bowl
  l9: "1547592166-23ac45744acd", // miso soup
  l10: "1529006557810-274b9b2fc783", // shawarma wrap
  l11: "1565557623262-b51c2513a641", // chicken tikka bowl
  l12: "1528735602780-2552fd46c7af", // croque monsieur
  l13: "1540189549336-e6e99c3679fe", // greek salad halloumi
  l14: "1626700051175-6818013e1d4f", // hummus wrap
  // Dinners
  d1: "1532550907401-a500c9a57435", // chicken & greens
  d2: "1551183053-bf91a1d81141", // tomato pasta
  d3: "1574484284002-952d92456975", // curry
  d4: "1467003909585-2f8a72700288", // sheet pan salmon
  d5: "1512058564366-18510be2db19", // stir fry
  d6: "1547592180-85f173990554", // lentil soup
  d7: "1476124369491-e7addf5db371", // lemon chicken risotto
  d8: "1612874742237-6526221588e3", // carbonara
  d9: "1551504734-5ee1c4a1479b", // lime chicken tacos
  d10: "1559314809-0d155014e29e", // pad thai
  d11: "1603133872878-684f208fb84b", // egg fried rice
  d12: "1547592180-85f173990554", // chickpea stew
  d13: "1585937421612-70a008356fbe", // red lentil dhal
  d14: "1572453800999-e8d2d1589b7c", // ratatouille
  d15: "1543339494-b4cd4f7ba686", // mac and cheese
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
