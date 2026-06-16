# Recipe catalog API

Forkcast can now expand beyond the built-in recipes by loading an external recipe catalog into local cache.

## Default mode

No setup is required. The app falls back to TheMealDB, which is free and gives the planner more variety immediately.

## Large catalog mode

For a much larger recipe pool with nutrition data, add a Spoonacular API key to the app environment:

```bash
VITE_SPOONACULAR_API_KEY=your_key_here
```

After deployment, the app will:

- fetch breakfast, lunch, and dinner recipes from Spoonacular;
- convert them into Forkcast `Recipe` objects;
- cache them in localStorage for 7 days;
- include them in Today, Week, Grocery, recipe details, swaps, and scoring.

## Notes

- The built-in recipes and personal recipes remain available even if the external API fails.
- TheMealDB fallback has estimated macros because it does not provide full nutrition data.
- Spoonacular recipes use API-provided nutrition when available.
