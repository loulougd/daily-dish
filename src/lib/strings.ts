// All user-facing copy lives here so future translation is a single-file change.
export const t = {
  appName: "Forkcast",
  tagline: "What should I eat today?",

  nav: {
    today: "Today",
    week: "Week",
    grocery: "Grocery",
    settings: "Settings",
  },

  onboarding: {
    welcomeTitle: "Welcome to Forkcast",
    welcomeBody:
      "Daily meal ideas that fit your real life — your energy, your schedule, your weather. Not a diet app.",
    start: "Get started",
    next: "Continue",
    back: "Back",
    finish: "See today’s meals",
    skip: "Skip",

    goal: {
      title: "What’s your main goal?",
      sub: "We’ll adapt portions and nutrient balance to match.",
      options: {
        lose: { label: "Gently lose fat", desc: "Lighter, protein-forward" },
        muscle: { label: "Build muscle", desc: "Higher protein, steady carbs" },
        maintain: { label: "Maintain", desc: "Balanced, varied meals" },
        better: { label: "Just eat better", desc: "More whole foods, less stress" },
      },
    },

    guidance: {
      title: "How do you like to think about food?",
      sub: "You can change this anytime.",
      options: {
        calories: { label: "Calories & macros", desc: "Show numbers on each meal" },
        portions: { label: "Visual portions", desc: "Palm, fist, handfuls, thumbs" },
      },
    },

    time: {
      title: "How much time do you usually have to cook?",
      sub: "We’ll bias your daily picks toward this.",
      options: {
        t10: "10 minutes",
        t20: "20 minutes",
        t45: "45 minutes",
        prep: "Meal prep weekends",
      },
    },

    effort: {
      title: "Your usual cooking energy?",
      options: {
        nobrain: { label: "No-brain meals", desc: "Minimal thinking, few steps" },
        simple: { label: "Simple meals", desc: "A pan and a knife" },
        proper: { label: "I enjoy cooking properly", desc: "Bring on the techniques" },
      },
    },

    training: {
      title: "Which days do you train?",
      sub: "Tap a day to set its intensity.",
      light: "Light",
      moderate: "Moderate",
      intense: "Intense",
      rest: "Rest",
    },

    diet: {
      title: "Anything you don’t eat?",
      sub: "Allergies, intolerances, choices — we’ll respect them strictly.",
      options: [
        "Gluten-free",
        "Lactose-free",
        "Nut-free",
        "Vegetarian",
        "Vegan",
        "Pescatarian",
        "Halal",
      ],
      otherPlaceholder: "Anything else? (e.g. shellfish)",
    },

    hated: {
      title: "Any foods you can’t stand?",
      sub: "Add ingredients to permanently exclude.",
      placeholder: "Type and press Enter (e.g. olives)",
    },

    style: {
      title: "Your preferred meal style",
      sub: "Slide to where you feel most at home.",
      left: "Clean & light",
      mid: "Balanced",
      right: "Comfort, smart",
    },

    budget: {
      title: "Weekly food budget",
      options: {
        low: { label: "Low", desc: "Pantry staples, simple proteins" },
        medium: { label: "Medium", desc: "A nice mix" },
        high: { label: "High", desc: "Quality ingredients, more variety" },
      },
    },

    household: {
      title: "How many people are you cooking for?",
      sub: "Recipe quantities will scale automatically.",
    },

    city: {
      title: "Where are you cooking from?",
      sub: "We use local weather to suggest comforting or fresh meals.",
      placeholder: "City (e.g. Lisbon)",
    },

    cycle: {
      title: "Optional: menstrual cycle tracking",
      sub: "If you’d like, we’ll gently adapt suggestions to your cycle phase.",
      disclaimer:
        "Cycle-based suggestions are general wellness guidance, not medical advice.",
      enable: "Enable cycle tracking",
      skip: "Not for me",
      lastPeriod: "Last period start date",
      cycleLength: "Average cycle length (days)",
    },
  },

  today: {
    greetMorning: "Good morning",
    greetAfternoon: "Good afternoon",
    greetEvening: "Good evening",
    contextLabels: {
      weather: "Weather",
      training: "Training",
      energy: "Energy",
      time: "Time",
      cycle: "Cycle",
    },
    checkin: "How are you feeling right now?",
    energy: { low: "Low energy", normal: "Normal", motivated: "Motivated" },
    timeToday: "How much time today?",
    useUp: "Use up:",
    useUpPlaceholder: "Spinach, eggs, leftover rice…",
    why: "Why this today",
    viewRecipe: "View recipe",
    swap: "Swap",
    swapsLeft: (n: number) => `${n} free swaps left today`,
    upgradeForUnlimited: "Upgrade for unlimited swaps",
    meals: { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" },
  },

  recipe: {
    ingredients: "Ingredients",
    steps: "Method",
    portionGuide: "Visual portion guide",
    macros: "Per serving",
    forPeople: (n: number) => `Scaled for ${n} ${n === 1 ? "person" : "people"}`,
    swap: "Swap this meal",
    back: "Back",
  },

  week: {
    title: "This week",
    sub: "A flexible outline. Each day stays adaptive — tap a day to plan it live.",
    premiumHint: "Full dynamic week planning is part of Forkcast Plus.",
  },

  grocery: {
    title: "Grocery list",
    sub: "Combined from your weekly outline.",
    categories: {
      produce: "Produce",
      protein: "Protein",
      dairy: "Dairy",
      grains: "Grains",
      pantry: "Pantry",
      other: "Other",
    },
    usedIn: (n: number) => `Used in ${n} meals this week`,
  },

  premium: {
    title: "Forkcast Plus",
    sub: "Your daily decision tool, with deeper personalization.",
    free: "Free",
    plus: "Plus",
    cta: "Start 7-day free trial",
    note: "No payment connected yet — preview only.",
    features: {
      today: "Today dashboard with 3 daily meals",
      checkin: "Mood & time check-in",
      swaps: "5 free swaps per day",
      week: "Full 7-day dynamic planning",
      antiwaste: "Advanced anti-waste grocery optimization",
      personalization: "Training & cycle-based personalization",
      households: "Household profiles",
      themedays: "Theme days (taco Tuesday, pasta Friday…)",
      restaurant: "Restaurant photo to recipe",
    },
  },

  settings: {
    title: "Settings",
    profile: "Profile",
    preferences: "Preferences",
    cycle: "Cycle tracking",
    about: "About",
    editGoal: "Goal",
    editGuidance: "Guidance style",
    editTime: "Time available",
    editEffort: "Cooking effort",
    editDiet: "Dietary restrictions",
    editHated: "Foods you hate",
    editBudget: "Budget",
    editHousehold: "Household size",
    editCity: "City",
    cycleDisclaimer:
      "Cycle suggestions are general wellness guidance, not medical advice.",
    reset: "Reset onboarding",
    upgrade: "Upgrade to Plus",
  },
};
