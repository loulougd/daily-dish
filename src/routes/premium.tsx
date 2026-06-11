import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { t } from "@/lib/strings";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "Forkcast Plus" },
      { name: "description", content: "Deeper personalization, full week planning, and advanced anti-waste." },
    ],
  }),
  component: PremiumPage,
});

const FREE = [
  t.premium.features.today,
  t.premium.features.checkin,
  t.premium.features.swaps,
];

const PLUS = [
  t.premium.features.week,
  t.premium.features.antiwaste,
  t.premium.features.personalization,
  t.premium.features.households,
  t.premium.features.themedays,
  t.premium.features.restaurant,
];

function PremiumPage() {
  return (
    <div className="min-h-screen bg-cream pb-16">
      <header className="px-6 pt-8 pb-6">
        <Link
          to="/today"
          className="inline-flex items-center gap-2 text-sm text-ink/60 font-semibold"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
      </header>

      <div className="px-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-soft text-terracotta eyebrow mb-4">
          <Sparkles className="size-3" /> Plus
        </div>
        <h1 className="font-serif text-5xl leading-[1.05] mb-3 text-balance">
          {t.premium.title}
        </h1>
        <p className="text-ink/70 leading-relaxed text-pretty max-w-[36ch]">
          {t.premium.sub}
        </p>
      </div>

      <section className="mx-6 mt-8 grid grid-cols-2 gap-3">
        <Card title={t.premium.free} accent={false}>
          {FREE.map((f) => (
            <Feature key={f} text={f} />
          ))}
        </Card>
        <Card title={t.premium.plus} accent>
          {PLUS.map((f) => (
            <Feature key={f} text={f} accent />
          ))}
        </Card>
      </section>

      <div className="px-6 mt-10">
        <button
          disabled
          className="w-full py-4 rounded-2xl bg-ink text-cream text-sm font-semibold disabled:opacity-90"
        >
          {t.premium.cta}
        </button>
        <p className="text-center text-[11px] text-ink/45 italic mt-3">
          {t.premium.note}
        </p>
      </div>
    </div>
  );
}

function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl p-4 border ${
        accent
          ? "bg-ink text-cream border-ink"
          : "bg-card border-stone-warm text-ink"
      }`}
    >
      <p
        className={`eyebrow mb-3 ${accent ? "text-terracotta" : "text-ink/50"}`}
      >
        {title}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function Feature({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <li className="flex gap-2 text-xs leading-snug">
      <Check
        className={`size-3.5 shrink-0 mt-0.5 ${
          accent ? "text-terracotta" : "text-sage"
        }`}
        strokeWidth={3}
      />
      <span className={accent ? "text-cream/90" : "text-ink/75"}>{text}</span>
    </li>
  );
}
