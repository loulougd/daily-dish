import { Trophy, Flame, ChefHat, Star } from "lucide-react";
import type { CookingStats } from "@/lib/profile";

interface Props {
  stats: CookingStats;
}

interface Badge {
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
}

function getBadges(stats: CookingStats): Badge[] {
  return [
    {
      emoji: "👨‍🍳",
      name: "First Cook",
      desc: "Cooked your first recipe",
      earned: stats.totalCooked >= 1,
    },
    {
      emoji: "🔥",
      name: "On Fire",
      desc: "3-day cooking streak",
      earned: stats.streak >= 3,
    },
    {
      emoji: "🌍",
      name: "World Taster",
      desc: "Tried 10 different recipes",
      earned: stats.recipesCooked.length >= 10,
    },
    {
      emoji: "⭐",
      name: "Regulier",
      desc: "Cooked 25 meals total",
      earned: stats.totalCooked >= 25,
    },
    {
      emoji: "🏆",
      name: "Home Chef",
      desc: "Tried 25 different recipes",
      earned: stats.recipesCooked.length >= 25,
    },
    {
      emoji: "💎",
      name: "Forkcast Master",
      desc: "7-day streak + 40 recipes tried",
      earned: stats.streak >= 7 && stats.recipesCooked.length >= 40,
    },
  ];
}

function getLevel(total: number): { level: number; name: string; next: number } {
  if (total >= 100) return { level: 6, name: "Master Chef", next: Infinity };
  if (total >= 60) return { level: 5, name: "Sous Chef", next: 100 };
  if (total >= 35) return { level: 4, name: "Line Cook", next: 60 };
  if (total >= 15) return { level: 3, name: "Home Cook", next: 35 };
  if (total >= 5) return { level: 2, name: "Apprentice", next: 15 };
  return { level: 1, name: "Beginner", next: 5 };
}

export function CookingStatsCard({ stats }: Props) {
  const badges = getBadges(stats);
  const earned = badges.filter((b) => b.earned);
  const lvl = getLevel(stats.totalCooked);
  const pct = lvl.next === Infinity ? 100 : Math.round((stats.totalCooked / lvl.next) * 100);

  return (
    <section className="mx-6 mb-6 bg-card border border-stone-warm/50 rounded-2xl p-5">
      {/* Level + progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="size-12 rounded-2xl bg-sage text-cream grid place-items-center">
          <ChefHat className="size-6" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-ink">
              Level {lvl.level} — {lvl.name}
            </span>
            <span className="text-[10px] font-bold text-ink/40 tabular-nums">
              {stats.totalCooked}{lvl.next !== Infinity ? `/${lvl.next}` : ""}
            </span>
          </div>
          <div className="h-2 bg-stone-warm/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatBox
          Icon={Trophy}
          value={stats.recipesCooked.length}
          label="Recipes tried"
        />
        <StatBox
          Icon={Star}
          value={stats.totalCooked}
          label="Meals cooked"
        />
        <StatBox
          Icon={Flame}
          value={stats.streak}
          label="Day streak"
          accent={stats.streak >= 3}
        />
      </div>

      {/* Badges */}
      {earned.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-2">
            Badges earned
          </p>
          <div className="flex flex-wrap gap-2">
            {earned.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-1.5 bg-sage-soft/50 rounded-full px-2.5 py-1"
                title={b.desc}
              >
                <span className="text-sm">{b.emoji}</span>
                <span className="text-[10px] font-semibold text-sage">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next badge hint */}
      {badges.filter((b) => !b.earned).length > 0 && (
        <p className="text-[10px] text-ink/40 mt-3 italic">
          Next: {badges.find((b) => !b.earned)?.emoji} {badges.find((b) => !b.earned)?.name} — {badges.find((b) => !b.earned)?.desc}
        </p>
      )}
    </section>
  );
}

function StatBox({
  Icon,
  value,
  label,
  accent,
}: {
  Icon: typeof Trophy;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-stone-warm/30 rounded-xl p-3 text-center">
      <Icon
        className={`size-4 mx-auto mb-1 ${accent ? "text-terracotta" : "text-ink/40"}`}
        strokeWidth={2}
      />
      <div className={`text-lg font-bold tabular-nums ${accent ? "text-terracotta" : "text-ink"}`}>
        {value}
      </div>
      <div className="text-[9px] font-semibold text-ink/40 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
