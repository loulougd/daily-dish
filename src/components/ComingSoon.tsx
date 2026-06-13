import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ComingSoonItem {
  title: string;
  body: string;
  Icon: LucideIcon;
  tag?: "soon" | "plus";
}

/**
 * Quietly signals the long-term vision without overloading V1.
 * Each card maps to a planned feature (sleep check-in, calendar sync,
 * household profiles, anti-waste, restaurant→recipe, budget intel).
 */
export function ComingSoon({ items }: { items: ComingSoonItem[] }) {
  return (
    <section className="px-6 mt-10">
      <p className="eyebrow text-ink/45 mb-3">Coming to Forkcast</p>
      <div className="space-y-2.5">
        {items.map(({ title, body, Icon, tag = "soon" }) => (
          <div
            key={title}
            className="flex gap-3 items-start rounded-2xl border border-stone-warm bg-card/60 px-4 py-3.5"
          >
            <div className="size-9 shrink-0 rounded-xl bg-sage-soft grid place-items-center">
              <Icon className="size-4 text-sage" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base leading-tight">{title}</h3>
                <Badge tag={tag} />
              </div>
              <p className="text-xs text-ink/55 leading-relaxed mt-1 text-pretty">
                {body}
              </p>
            </div>
          </div>
        ))}
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

function Badge({ tag }: { tag: "soon" | "plus" }) {
  if (tag === "plus") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-ink text-cream text-[9px] font-bold uppercase tracking-wider">
        <Sparkles className="size-2.5" /> Plus
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-stone-warm text-ink/60 text-[9px] font-bold uppercase tracking-wider">
      <Lock className="size-2.5" /> Soon
    </span>
  );
}
