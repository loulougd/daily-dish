import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Lock, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { t } from "@/lib/strings";

export const Route = createFileRoute("/snap")({
  head: () => ({
    meta: [
      { title: "Snap a dish — Forkcast" },
      {
        name: "description",
        content: "Photograph a restaurant plate and get the recipe at home — tuned to your preferences.",
      },
      { property: "og:title", content: "Snap a dish — Forkcast" },
      {
        property: "og:description",
        content: "Turn any restaurant plate into a home recipe tuned to your week.",
      },
    ],
  }),
  component: SnapPage,
});

// V1: UI is built but identification is locked behind Plus.
const IS_PREMIUM = false;

function SnapPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-6">
        <p className="eyebrow text-terracotta mb-2">{t.nav.snap}</p>
        <h1 className="font-serif text-4xl leading-[1.05] mb-2 text-balance">
          {t.snap.title}
        </h1>
        <p className="text-sm text-ink/60 leading-relaxed max-w-[36ch] text-pretty">
          {t.snap.sub}
        </p>
      </header>

      <section className="px-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-stone-warm bg-card/40 grid place-items-center text-center px-6"
          >
            {preview ? (
              <img
                src={preview}
                alt="Your dish"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="size-14 rounded-2xl bg-terracotta-soft grid place-items-center">
                  <Camera className="size-6 text-terracotta" strokeWidth={1.75} />
                </div>
                <p className="font-serif text-xl text-ink/80">{t.snap.cta}</p>
                <p className="text-xs text-ink/50 max-w-[28ch]">{t.snap.hint}</p>
              </div>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          {!IS_PREMIUM && (
            <div className="absolute inset-0 rounded-2xl bg-cream/55 backdrop-blur-[2px] grid place-items-center">
              <div className="bg-card border border-stone-warm rounded-2xl px-5 py-4 text-center shadow-sm">
                <Lock className="size-4 text-terracotta mx-auto mb-1.5" />
                <p className="font-serif text-lg leading-tight">{t.snap.lockedTitle}</p>
                <p className="text-xs text-ink/55 mt-1 mb-3 max-w-[22ch] mx-auto">
                  {t.snap.lockedBody}
                </p>
                <Link
                  to="/premium"
                  className="inline-block px-4 py-2 rounded-xl bg-terracotta text-cream text-xs font-bold uppercase tracking-wider"
                >
                  {t.snap.unlock}
                </Link>
              </div>
            </div>
          )}
        </div>

        {preview && (
          <p className="mt-3 text-xs text-ink/55 italic text-center">
            {t.snap.comingSoonNote}
          </p>
        )}
      </section>

      <section className="px-6 mt-8">
        <p className="eyebrow text-ink/55 mb-3">How it works</p>
        <ol className="space-y-2.5">
          {t.snap.steps.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-card border border-stone-warm/50 px-4 py-3"
            >
              <span className="size-6 rounded-full bg-sage-soft text-sage text-xs font-bold grid place-items-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-ink/75 leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-6 mt-8 rounded-2xl bg-terracotta-soft/70 border border-terracotta/15 p-4 flex gap-3">
        <Sparkles className="size-4 text-terracotta shrink-0 mt-0.5" />
        <p className="text-xs text-ink/70 leading-relaxed">
          {t.snap.footer}
        </p>
      </div>
    </AppShell>
  );
}
