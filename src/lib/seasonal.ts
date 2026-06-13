// Seasonal produce by month — UK / Northern Europe focus.
// Used to give a small scoring bonus to recipes containing in-season ingredients.

const SEASONAL: Record<number, string[]> = {
  0: ["leeks", "parsnip", "cabbage", "kale", "beetroot", "swede", "celeriac", "brussels sprouts", "pear", "apple"],
  1: ["leeks", "parsnip", "cabbage", "kale", "beetroot", "swede", "cauliflower", "blood orange", "rhubarb", "turnip"],
  2: ["purple sprouting broccoli", "spring onion", "watercress", "rhubarb", "leeks", "cauliflower", "spinach", "cabbage"],
  3: ["asparagus", "radish", "spinach", "spring onion", "watercress", "new potatoes", "rhubarb", "wild garlic"],
  4: ["asparagus", "broad beans", "new potatoes", "radish", "spinach", "spring onion", "strawberries", "rocket", "peas"],
  5: ["strawberries", "broad beans", "courgette", "new potatoes", "peas", "asparagus", "cherries", "gooseberries", "lettuce", "radish"],
  6: ["courgette", "tomato", "strawberries", "raspberries", "cherries", "beans", "peas", "cucumber", "beetroot", "blueberries"],
  7: ["tomato", "courgette", "sweetcorn", "pepper", "aubergine", "beans", "cucumber", "plum", "blackberries", "figs"],
  8: ["blackberries", "plum", "sweetcorn", "apple", "pear", "squash", "beetroot", "courgette", "tomato", "mushrooms"],
  9: ["squash", "pumpkin", "apple", "pear", "mushrooms", "beetroot", "kale", "leeks", "parsnip", "sweet potato"],
  10: ["squash", "pumpkin", "parsnip", "kale", "sweet potato", "beetroot", "leeks", "apple", "pear", "cranberries"],
  11: ["brussels sprouts", "parsnip", "kale", "leeks", "beetroot", "sweet potato", "cranberries", "pear", "clementine", "cabbage"],
};

export function getSeasonalIngredients(date = new Date()): string[] {
  return SEASONAL[date.getMonth()] ?? [];
}

export function countSeasonalMatches(ingredientNames: string[], date = new Date()): { count: number; matches: string[] } {
  const seasonal = getSeasonalIngredients(date);
  const matches: string[] = [];
  for (const name of ingredientNames) {
    const lower = name.toLowerCase();
    for (const s of seasonal) {
      if (lower.includes(s) || s.includes(lower)) {
        matches.push(s);
        break;
      }
    }
  }
  return { count: matches.length, matches };
}
