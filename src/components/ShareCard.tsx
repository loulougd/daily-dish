import { Share2, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Recipe, Weather } from "@/lib/types";
import { photoUrl } from "@/lib/recipe-photos";

interface Props {
  recipe: Recipe;
  weather: Weather;
  city: string;
  why: string;
}

export function ShareButton({ recipe, weather, city, why }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="size-8 rounded-lg inline-flex items-center justify-center bg-card text-ink/40 border border-stone-warm hover:text-sage transition-colors"
        aria-label="Share"
      >
        <Share2 className="size-3.5" strokeWidth={2} />
      </button>

      {open && (
        <ShareModal
          recipe={recipe}
          weather={weather}
          city={city}
          why={why}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ShareModal({
  recipe,
  weather,
  city,
  why,
  onClose,
}: Props & { onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const photo = photoUrl(recipe.id, recipe.mealType, { w: 800, h: 800 });
  const dayName = new Date().toLocaleDateString(undefined, { weekday: "long" });

  const handleShare = async () => {
    // Try native Web Share API (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Today's ${recipe.mealType} — ${recipe.name}`,
          text: `${recipe.name} 🍽️\n${why}\n${weather.tempC}°C in ${city}\n\nPlanned with Forkcast`,
        });
        onClose();
        return;
      } catch {
        // User cancelled or API failed, fall through to copy
      }
    }

    // Fallback: copy text to clipboard
    const text = `${recipe.name} 🍽️\n${why}\n${weather.tempC}°C in ${city}\n\nPlanned with Forkcast`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      // Clipboard failed
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-[320px] animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="ml-auto mb-3 size-8 rounded-full bg-cream/90 text-ink/60 grid place-items-center float-right"
        >
          <X className="size-4" strokeWidth={2} />
        </button>

        {/* Card preview */}
        <div
          ref={cardRef}
          className="bg-cream rounded-3xl overflow-hidden shadow-xl clear-both"
        >
          {/* Photo */}
          <div className="relative aspect-square">
            <img
              src={photo}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-cream/70 mb-1">
                {dayName}'s {recipe.mealType}
              </p>
              <h3 className="font-serif text-xl text-cream leading-tight">
                {recipe.name}
              </h3>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-ink/60 leading-relaxed mb-3 line-clamp-2">
              {why}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-[11px] text-ink/50">
                <span>{weather.tempC}°C {city}</span>
                <span>{recipe.prepMinutes} min</span>
                <span>{recipe.calories} kcal</span>
              </div>
              <span className="text-[10px] font-bold text-sage italic">
                Forkcast
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-2xl bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            <Share2 className="size-4 inline mr-2" strokeWidth={2} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
