import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface ComingSoonItem {
  title: string;
  body: string;
  Icon: LucideIcon;
  tag?: "soon" | "plus";
}

/**
 * Editorial-style "what's next" cards. A subtle left border accent
 * (terracotta=plus, sage=soon) replaces noisy pill badges.
 */
export function ComingSoon({ items }: { items: ComingSoonItem[] }) {
  return (
    <section className="px-6 mt-10">
      <p className="eyebrow text-ink/45 mb-3">Coming to Forkcast</p>
      <div className="space-y-2">
        {items.map(({ title, body, Icon, tag = "soon" }) => {
          const accent =
            tag === "plus"
              ? "border-l-terracotta"
              : "border-l-sage";
          return (
            <div
              key={title}
              className={`relative flex gap-3 items-start rounded-xl bg-card/70 pl-4 pr-4 py-3 border border-stone-warm/40 border-l-[3px] ${accent}`}
            >
              <Icon className="size-4 text-ink/55 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-serif text-[15px] leading-tight">{title}</h3>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      tag === "plus" ? "text-terracotta" : "text-sage"
                    }`}
                  >
                    {tag === "plus" ? "Plus" : "Soon"}
                  </span>
                </div>
                <p className="text-xs text-ink/55 leading-relaxed mt-0.5 text-pretty">
                  {body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        to="/premium"
        className="mt-4 block text-center text-xs text-terracotta font-semibold tracking-wide"
      >
        See the full Plus vision →
      </Link>
    </section>
  );
}
