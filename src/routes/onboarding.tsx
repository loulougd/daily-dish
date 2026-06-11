import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";
import type {
  Budget,
  Effort,
  Goal,
  Guidance,
  Intensity,
  TimeBucket,
} from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Forkcast" },
      {
        name: "description",
        content: "Set up Forkcast in two minutes. Your goal, schedule, dietary needs, and how much time you have to cook.",
      },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  "welcome",
  "goal",
  "guidance",
  "time",
  "effort",
  "training",
  "diet",
  "hated",
  "style",
  "budget",
  "household",
  "city",
  "cycle",
] as const;
type Step = (typeof STEPS)[number];

function Onboarding() {
  const navigate = useNavigate();
  const { profile, update } = useProfile();
  const [stepIdx, setStepIdx] = useState(0);
  const step: Step = STEPS[stepIdx];

  const progress = (stepIdx / (STEPS.length - 1)) * 100;
  const next = () => {
    if (stepIdx === STEPS.length - 1) {
      update({ onboarded: true });
      navigate({ to: "/today" });
    } else {
      setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    }
  };
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      {/* Top bar */}
      <header className="px-6 pt-10 pb-6">
        <div className="flex items-center gap-3">
          {stepIdx > 0 ? (
            <button
              onClick={back}
              className="text-xs text-ink/50 hover:text-ink font-semibold"
            >
              {t.onboarding.back}
            </button>
          ) : (
            <span className="font-serif italic text-lg text-ink/60">Forkcast</span>
          )}
          <div className="h-1 flex-1 bg-stone-warm/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-ink/40 tabular-nums">
            {String(stepIdx + 1).padStart(2, "0")}/{String(STEPS.length).padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="flex-1 px-6 pb-32">
        {step === "welcome" && <WelcomeStep onStart={next} />}
        {step === "goal" && (
          <SingleChoiceStep
            title={t.onboarding.goal.title}
            sub={t.onboarding.goal.sub}
            value={profile.goal}
            options={(Object.entries(t.onboarding.goal.options) as [Goal, { label: string; desc: string }][]).map(
              ([id, o]) => ({ id, label: o.label, desc: o.desc }),
            )}
            onSelect={(v) => update({ goal: v as Goal })}
          />
        )}
        {step === "guidance" && (
          <SingleChoiceStep
            title={t.onboarding.guidance.title}
            sub={t.onboarding.guidance.sub}
            value={profile.guidance}
            options={(Object.entries(t.onboarding.guidance.options) as [Guidance, { label: string; desc: string }][]).map(
              ([id, o]) => ({ id, label: o.label, desc: o.desc }),
            )}
            onSelect={(v) => update({ guidance: v as Guidance })}
          />
        )}
        {step === "time" && (
          <SingleChoiceStep
            title={t.onboarding.time.title}
            sub={t.onboarding.time.sub}
            value={profile.time}
            options={(Object.entries(t.onboarding.time.options) as [TimeBucket, string][]).map(
              ([id, label]) => ({ id, label }),
            )}
            onSelect={(v) => update({ time: v as TimeBucket })}
          />
        )}
        {step === "effort" && (
          <SingleChoiceStep
            title={t.onboarding.effort.title}
            value={profile.effort}
            options={(Object.entries(t.onboarding.effort.options) as [Effort, { label: string; desc: string }][]).map(
              ([id, o]) => ({ id, label: o.label, desc: o.desc }),
            )}
            onSelect={(v) => update({ effort: v as Effort })}
          />
        )}
        {step === "training" && (
          <TrainingStep
            training={profile.training}
            onChange={(training) => update({ training })}
          />
        )}
        {step === "diet" && (
          <DietStep
            selected={profile.diet}
            other={profile.dietOther}
            onSelected={(diet) => update({ diet })}
            onOther={(dietOther) => update({ dietOther })}
          />
        )}
        {step === "hated" && (
          <ChipsStep
            title={t.onboarding.hated.title}
            sub={t.onboarding.hated.sub}
            placeholder={t.onboarding.hated.placeholder}
            value={profile.hated}
            onChange={(hated) => update({ hated })}
          />
        )}
        {step === "style" && (
          <StyleStep
            value={profile.style}
            onChange={(style) => update({ style })}
          />
        )}
        {step === "budget" && (
          <SingleChoiceStep
            title={t.onboarding.budget.title}
            value={profile.budget}
            options={(Object.entries(t.onboarding.budget.options) as [Budget, { label: string; desc: string }][]).map(
              ([id, o]) => ({ id, label: o.label, desc: o.desc }),
            )}
            onSelect={(v) => update({ budget: v as Budget })}
          />
        )}
        {step === "household" && (
          <NumberStep
            title={t.onboarding.household.title}
            sub={t.onboarding.household.sub}
            value={profile.household}
            min={1}
            max={8}
            onChange={(household) => update({ household })}
          />
        )}
        {step === "city" && (
          <CityStep value={profile.city} onChange={(city) => update({ city })} />
        )}
        {step === "cycle" && (
          <CycleStep
            cycle={profile.cycle}
            onChange={(cycle) => update({ cycle })}
          />
        )}
      </div>

      {/* Sticky CTA */}
      {step !== "welcome" && (
        <div className="fixed bottom-0 inset-x-0 bg-cream/95 backdrop-blur-xl border-t border-stone-warm/60">
          <div className="mx-auto max-w-md px-6 py-4 pb-6 flex gap-3">
            {stepIdx > 0 && (
              <button
                onClick={back}
                className="px-5 py-3.5 rounded-2xl border border-stone-warm text-ink/70 text-sm font-semibold bg-card"
              >
                {t.onboarding.back}
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 py-3.5 rounded-2xl bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {stepIdx === STEPS.length - 1 ? t.onboarding.finish : t.onboarding.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full pt-12">
      <p className="eyebrow text-terracotta mb-4">Forkcast</p>
      <h1 className="font-serif text-5xl leading-[1.05] mb-6 text-balance">
        {t.onboarding.welcomeTitle}
      </h1>
      <p className="text-lg text-ink/70 leading-relaxed text-pretty max-w-[34ch]">
        {t.onboarding.welcomeBody}
      </p>
      <div className="mt-auto pt-12">
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-ink text-cream text-sm font-semibold active:scale-[0.98] transition-transform"
        >
          {t.onboarding.start}
        </button>
      </div>
    </div>
  );
}

interface ChoiceOpt {
  id: string;
  label: string;
  desc?: string;
}

function StepHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-4xl leading-tight mb-3 text-balance">{title}</h2>
      {sub && <p className="text-ink/60 text-sm leading-relaxed">{sub}</p>}
    </div>
  );
}

function SingleChoiceStep({
  title,
  sub,
  options,
  value,
  onSelect,
}: {
  title: string;
  sub?: string;
  options: ChoiceOpt[];
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <StepHeader title={title} sub={sub} />
      <div className="space-y-3">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all bg-card flex items-center justify-between gap-4 ${
                active
                  ? "border-sage ring-2 ring-sage/20 shadow-sm"
                  : "border-stone-warm hover:border-ink/30"
              }`}
            >
              <div>
                <div className={`font-semibold ${active ? "text-sage" : "text-ink"}`}>
                  {o.label}
                </div>
                {o.desc && <div className="text-xs text-ink/55 mt-0.5">{o.desc}</div>}
              </div>
              <div
                className={`size-5 rounded-full border-2 grid place-items-center shrink-0 ${
                  active ? "border-sage bg-sage" : "border-stone-warm"
                }`}
              >
                {active && <Check className="size-3 text-cream" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrainingStep({
  training,
  onChange,
}: {
  training: Record<number, Intensity>;
  onChange: (v: Record<number, Intensity>) => void;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const intensities: Intensity[] = ["rest", "light", "moderate", "intense"];
  const labels: Record<Intensity, string> = {
    rest: "Rest",
    light: t.onboarding.training.light,
    moderate: t.onboarding.training.moderate,
    intense: t.onboarding.training.intense,
  };
  return (
    <div>
      <StepHeader title={t.onboarding.training.title} sub={t.onboarding.training.sub} />
      <div className="space-y-3">
        {days.map((d, i) => {
          const v = training[i] ?? "rest";
          const idx = intensities.indexOf(v);
          const cycle = () =>
            onChange({ ...training, [i]: intensities[(idx + 1) % intensities.length] });
          return (
            <button
              key={d}
              onClick={cycle}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-stone-warm"
            >
              <span className="font-semibold text-ink">{d}</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                  v === "rest"
                    ? "bg-stone-warm/60 text-ink/50"
                    : v === "intense"
                    ? "bg-terracotta-soft text-terracotta"
                    : "bg-sage-soft text-sage"
                }`}
              >
                {labels[v]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DietStep({
  selected,
  other,
  onSelected,
  onOther,
}: {
  selected: string[];
  other: string;
  onSelected: (s: string[]) => void;
  onOther: (s: string) => void;
}) {
  const toggle = (opt: string) =>
    onSelected(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt],
    );
  return (
    <div>
      <StepHeader title={t.onboarding.diet.title} sub={t.onboarding.diet.sub} />
      <div className="flex flex-wrap gap-2 mb-6">
        {t.onboarding.diet.options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                active
                  ? "bg-sage text-cream border-sage"
                  : "bg-card border-stone-warm text-ink/80"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={other}
        onChange={(e) => onOther(e.target.value)}
        placeholder={t.onboarding.diet.otherPlaceholder}
        className="w-full px-4 py-3.5 rounded-2xl bg-card border border-stone-warm text-sm outline-none focus:border-sage placeholder:text-ink/35"
      />
    </div>
  );
}

function ChipsStep({
  title,
  sub,
  placeholder,
  value,
  onChange,
}: {
  title: string;
  sub: string;
  placeholder: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v.toLowerCase())) return;
    onChange([...value, v.toLowerCase()]);
    setDraft("");
  };
  return (
    <div>
      <StepHeader title={title} sub={sub} />
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-3.5 rounded-2xl bg-card border border-stone-warm text-sm outline-none focus:border-sage placeholder:text-ink/35"
        />
        <button
          onClick={add}
          className="px-4 rounded-2xl bg-ink text-cream"
          aria-label="Add"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((v) => (
          <span
            key={v}
            className="px-3 py-1.5 rounded-full bg-terracotta-soft text-terracotta text-sm font-semibold inline-flex items-center gap-1.5"
          >
            {v}
            <button
              onClick={() => onChange(value.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StyleStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <StepHeader title={t.onboarding.style.title} sub={t.onboarding.style.sub} />
      <div className="bg-card border border-stone-warm rounded-3xl p-6">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-sage"
        />
        <div className="flex justify-between text-[11px] font-semibold text-ink/50 mt-4 uppercase tracking-wider">
          <span>{t.onboarding.style.left}</span>
          <span>{t.onboarding.style.mid}</span>
          <span>{t.onboarding.style.right}</span>
        </div>
      </div>
    </div>
  );
}

function NumberStep({
  title,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  title: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <StepHeader title={title} sub={sub} />
      <div className="bg-card border border-stone-warm rounded-3xl p-8 flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="size-12 rounded-full border border-stone-warm text-2xl text-ink/70"
        >
          −
        </button>
        <span className="font-serif text-6xl tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="size-12 rounded-full border border-stone-warm text-2xl text-ink/70"
        >
          +
        </button>
      </div>
    </div>
  );
}

function CityStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <StepHeader title={t.onboarding.city.title} sub={t.onboarding.city.sub} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.onboarding.city.placeholder}
        className="w-full px-4 py-4 rounded-2xl bg-card border border-stone-warm text-base outline-none focus:border-sage placeholder:text-ink/35"
      />
    </div>
  );
}

function CycleStep({
  cycle,
  onChange,
}: {
  cycle: import("@/lib/types").CycleSettings;
  onChange: (c: import("@/lib/types").CycleSettings) => void;
}) {
  return (
    <div>
      <StepHeader title={t.onboarding.cycle.title} sub={t.onboarding.cycle.sub} />
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => onChange({ ...cycle, enabled: true })}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold ${
            cycle.enabled
              ? "bg-sage text-cream"
              : "bg-card border border-stone-warm text-ink/70"
          }`}
        >
          {t.onboarding.cycle.enable}
        </button>
        <button
          onClick={() => onChange({ enabled: false, cycleLength: cycle.cycleLength || 28 })}
          className={`flex-1 py-3 rounded-2xl text-sm font-semibold ${
            !cycle.enabled
              ? "bg-ink text-cream"
              : "bg-card border border-stone-warm text-ink/70"
          }`}
        >
          {t.onboarding.cycle.skip}
        </button>
      </div>

      {cycle.enabled && (
        <div className="space-y-3 mb-5">
          <label className="block">
            <span className="eyebrow text-ink/50 block mb-2">
              {t.onboarding.cycle.lastPeriod}
            </span>
            <input
              type="date"
              value={cycle.lastPeriodISO ?? ""}
              onChange={(e) => onChange({ ...cycle, lastPeriodISO: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl bg-card border border-stone-warm text-sm outline-none focus:border-sage"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-ink/50 block mb-2">
              {t.onboarding.cycle.cycleLength}
            </span>
            <input
              type="number"
              min={20}
              max={40}
              value={cycle.cycleLength || 28}
              onChange={(e) =>
                onChange({ ...cycle, cycleLength: Number(e.target.value) || 28 })
              }
              className="w-full px-4 py-3.5 rounded-2xl bg-card border border-stone-warm text-sm outline-none focus:border-sage"
            />
          </label>
        </div>
      )}

      <p className="text-xs text-ink/50 italic leading-relaxed">
        {t.onboarding.cycle.disclaimer}
      </p>
    </div>
  );
}
