import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Plus, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";
import type {
  ActivityLevel,
  Budget,
  Effort,
  Goal,
  Guidance,
  Intensity,
  Sex,
  TimeBucket,
} from "@/lib/types";
import { calcDailyTargets, hasBiometrics } from "@/lib/nutrition";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Forkcast" },
      { name: "description", content: "Edit your goal, stats, preferences and cycle tracking." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, update, reset } = useProfile();
  const navigate = useNavigate();
  const targets = calcDailyTargets(profile);

  const handleReset = () => {
    if (typeof window !== "undefined" && !window.confirm(t.settings.resetConfirm)) return;
    reset();
    navigate({ to: "/onboarding" });
  };

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-6">
        <p className="eyebrow text-terracotta mb-2">Forkcast</p>
        <h1 className="font-serif text-4xl leading-tight">{t.settings.title}</h1>
      </header>

      {/* Goal */}
      <Section title={t.settings.sectionGoal}>
        <ChoiceRow
          value={profile.goal}
          options={(Object.entries(t.onboarding.goal.options) as [Goal, { label: string }][]).map(
            ([id, o]) => ({ id, label: o.label }),
          )}
          onChange={(v) => update({ goal: v as Goal })}
        />
        <SegmentRow
          label="Guidance"
          value={profile.guidance}
          options={[
            { id: "portions", label: "Portions" },
            { id: "calories", label: "Calories" },
          ]}
          onChange={(v) => update({ guidance: v as Guidance })}
        />
      </Section>

      {/* Stats */}
      <Section title={t.settings.sectionStats} note={t.settings.statsNote}>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label={t.onboarding.stats.age}
            value={profile.age}
            min={0}
            max={99}
            onChange={(age) => update({ age })}
            suffix="yrs"
          />
          <SelectField
            label={t.onboarding.stats.sex}
            value={profile.sex}
            options={Object.entries(t.onboarding.stats.sexOptions).map(([id, label]) => ({
              id,
              label,
            }))}
            onChange={(v) => update({ sex: v as Sex })}
          />
          <NumberField
            label={t.onboarding.stats.height}
            value={profile.heightCm}
            min={0}
            max={230}
            onChange={(heightCm) => update({ heightCm })}
            suffix="cm"
          />
          <NumberField
            label={t.onboarding.stats.weight}
            value={profile.weightKg}
            min={0}
            max={250}
            onChange={(weightKg) => update({ weightKg })}
            suffix="kg"
          />
          {(profile.goal === "lose" || profile.goal === "muscle") && (
            <NumberField
              label={t.onboarding.stats.target}
              value={profile.targetWeightKg}
              min={0}
              max={250}
              onChange={(targetWeightKg) => update({ targetWeightKg })}
              suffix="kg"
            />
          )}
        </div>
        <SelectField
          label={t.onboarding.stats.activity}
          value={profile.activityLevel}
          options={Object.entries(t.onboarding.stats.activityOptions).map(([id, o]) => ({
            id,
            label: o.label,
          }))}
          onChange={(v) => update({ activityLevel: v as ActivityLevel })}
        />
        {targets.hasData && (
          <div className="mt-3 rounded-xl bg-sage-soft/60 px-3 py-2.5 flex items-start gap-2">
            <Sparkles className="size-3.5 text-sage shrink-0 mt-0.5" />
            <p className="text-xs text-ink/75 leading-relaxed">
              Your daily target: <strong>{targets.kcal} kcal</strong> · P{targets.proteinG}g · C
              {targets.carbsG}g · F{targets.fatsG}g
            </p>
          </div>
        )}
      </Section>

      {/* Cooking preferences */}
      <Section title={t.settings.sectionCooking}>
        <SegmentRow
          label="Time"
          value={profile.time}
          options={(Object.entries(t.onboarding.time.options) as [TimeBucket, string][]).map(
            ([id, label]) => ({
              id,
              label: id === "t10" ? "10m" : id === "t20" ? "20m" : id === "t45" ? "45m" : "Prep",
            }),
          )}
          onChange={(v) => update({ time: v as TimeBucket })}
        />
        <ChoiceRow
          value={profile.effort}
          options={(
            Object.entries(t.onboarding.effort.options) as [Effort, { label: string }][]
          ).map(([id, o]) => ({ id, label: o.label }))}
          onChange={(v) => update({ effort: v as Effort })}
        />
        <div className="mt-3">
          <Label>Style</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={profile.style}
            onChange={(e) => update({ style: Number(e.target.value) })}
            className="w-full accent-sage mt-1"
          />
          <div className="flex justify-between text-[10px] font-bold text-ink/50 mt-1 uppercase tracking-wider">
            <span>Clean</span>
            <span>Balanced</span>
            <span>Comfort</span>
          </div>
        </div>
      </Section>

      {/* Training */}
      <Section title={t.settings.sectionTraining}>
        <TrainingPicker
          training={profile.training}
          onChange={(training) => update({ training })}
        />
      </Section>

      {/* Diet */}
      <Section title={t.settings.sectionDiet}>
        <ChipsField
          label="Restrictions"
          value={profile.diet}
          presets={t.onboarding.diet.options}
          onChange={(diet) => update({ diet })}
        />
        <ChipsField
          label="Foods you hate"
          value={profile.hated}
          onChange={(hated) => update({ hated })}
          allowAdd
          placeholder="e.g. olives"
        />
        <div className="mt-3">
          <Label>Other</Label>
          <input
            type="text"
            value={profile.dietOther}
            onChange={(e) => update({ dietOther: e.target.value })}
            placeholder={t.onboarding.diet.otherPlaceholder}
            className="w-full mt-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
          />
        </div>
      </Section>

      {/* Cycle */}
      <Section title={t.settings.sectionCycle}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">Enabled</span>
          <Toggle
            on={profile.cycle.enabled}
            onChange={(enabled) => update({ cycle: { ...profile.cycle, enabled } })}
          />
        </div>
        {profile.cycle.enabled && (
          <div className="space-y-3 mt-3">
            <div>
              <Label>{t.onboarding.cycle.lastPeriod}</Label>
              <input
                type="date"
                value={profile.cycle.lastPeriodISO ?? ""}
                onChange={(e) =>
                  update({ cycle: { ...profile.cycle, lastPeriodISO: e.target.value } })
                }
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
              />
            </div>
            <div>
              <Label>{t.onboarding.cycle.cycleLength}</Label>
              <input
                type="number"
                min={20}
                max={40}
                value={profile.cycle.cycleLength || 28}
                onChange={(e) =>
                  update({
                    cycle: { ...profile.cycle, cycleLength: Number(e.target.value) || 28 },
                  })
                }
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
              />
            </div>
          </div>
        )}
        <p className="text-[11px] text-ink/50 italic mt-3 leading-relaxed">
          {t.settings.cycleDisclaimer}
        </p>
      </Section>

      {/* Household & budget */}
      <Section title={t.settings.sectionHousehold}>
        <div className="flex items-center justify-between">
          <Label>People</Label>
          <Stepper
            value={profile.household}
            min={1}
            max={8}
            onChange={(household) => update({ household })}
          />
        </div>
        <div className="mt-3">
          <Label>Budget</Label>
          <SegmentRow
            value={profile.budget}
            options={(Object.entries(t.onboarding.budget.options) as [Budget, { label: string }][]).map(
              ([id, o]) => ({ id, label: o.label }),
            )}
            onChange={(v) => update({ budget: v as Budget })}
          />
        </div>
      </Section>

      {/* Location */}
      <Section title={t.settings.sectionLocation}>
        <Label>City</Label>
        <input
          type="text"
          value={profile.city}
          onChange={(e) => update({ city: e.target.value })}
          placeholder={t.onboarding.city.placeholder}
          className="w-full mt-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
        />
      </Section>

      {/* Account */}
      <Section title={t.settings.sectionAccount}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink/70">{t.settings.currentPlan}</span>
          <span className="text-sm font-semibold text-ink">{t.settings.free}</span>
        </div>
        <Link
          to="/premium"
          className="mt-3 block w-full py-3 rounded-xl bg-terracotta text-cream text-sm font-semibold text-center"
        >
          {t.settings.upgrade}
        </Link>
        <button
          onClick={handleReset}
          className="mt-2 block w-full py-3 rounded-xl border border-stone-warm text-ink/60 text-sm font-semibold"
        >
          {t.settings.reset}
        </button>
        <p className="text-[11px] text-ink/40 text-center mt-3">
          {t.settings.version} 0.2 · {hasBiometrics(profile) ? "Personalized" : "Generic targets"}
        </p>
      </Section>
    </AppShell>
  );
}

// ─── Reusable bits ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className="px-6 mb-6">
      <p className="eyebrow text-ink/55 mb-2">{title}</p>
      <div className="bg-card border border-stone-warm/60 rounded-2xl p-4">{children}</div>
      {note && <p className="text-[11px] text-ink/45 mt-2 italic px-1">{note}</p>}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/55 block">
      {children}
    </span>
  );
}

function ChoiceRow<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              active ? "bg-sage text-cream" : "bg-cream text-ink/70 hover:bg-stone-warm/50"
            }`}
          >
            <span>{o.label}</span>
            {active && <ChevronRight className="size-4" />}
          </button>
        );
      })}
    </div>
  );
}

function SegmentRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={label ? "mt-3" : ""}>
      {label && <Label>{label}</Label>}
      <div className={`grid gap-1.5 mt-1 bg-cream rounded-xl p-1 ${options.length === 2 ? "grid-cols-2" : options.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              value === o.id ? "bg-ink text-cream" : "text-ink/60"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-1 bg-cream border border-stone-warm rounded-xl px-3 py-2.5">
        <input
          type="number"
          min={min}
          max={max}
          value={value || ""}
          placeholder="—"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="bg-transparent text-sm font-semibold outline-none w-full min-w-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-xs text-ink/45">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        on ? "bg-sage" : "bg-stone-warm"
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-cream transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="size-8 rounded-full border border-stone-warm text-ink/70"
      >
        −
      </button>
      <span className="font-serif text-2xl tabular-nums w-8 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="size-8 rounded-full border border-stone-warm text-ink/70"
      >
        +
      </button>
    </div>
  );
}

function TrainingPicker({
  training,
  onChange,
}: {
  training: Record<number, Intensity>;
  onChange: (v: Record<number, Intensity>) => void;
}) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cycle = ["rest", "light", "moderate", "intense"] as Intensity[];
  const color: Record<Intensity, string> = {
    rest: "bg-stone-warm/60 text-ink/50",
    light: "bg-sage-soft text-sage",
    moderate: "bg-sage text-cream",
    intense: "bg-terracotta text-cream",
  };
  return (
    <div className="flex gap-1.5">
      {days.map((d, i) => {
        const v = training[i] ?? "rest";
        return (
          <button
            key={i}
            onClick={() => {
              const idx = cycle.indexOf(v);
              onChange({ ...training, [i]: cycle[(idx + 1) % cycle.length] });
            }}
            className={`flex-1 aspect-square rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors ${color[v]}`}
            aria-label={`${d}: ${v}`}
          >
            <span>{d}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-80">
              {v === "rest" ? "—" : v[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ChipsField({
  label,
  value,
  presets,
  placeholder,
  allowAdd,
  onChange,
}: {
  label: string;
  value: string[];
  presets?: readonly string[];
  placeholder?: string;
  allowAdd?: boolean;
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim().toLowerCase();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="mt-3 first:mt-0">
      <Label>{label}</Label>
      {presets && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {presets.map((o) => {
            const active = value.includes(o);
            return (
              <button
                key={o}
                onClick={() =>
                  onChange(active ? value.filter((x) => x !== o) : [...value, o])
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  active
                    ? "bg-sage text-cream border-sage"
                    : "bg-cream border-stone-warm text-ink/70"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      )}
      {value.filter((v) => !presets?.includes(v)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value
            .filter((v) => !presets?.includes(v))
            .map((v) => (
              <span
                key={v}
                className="px-3 py-1.5 rounded-full bg-terracotta-soft text-terracotta text-xs font-semibold inline-flex items-center gap-1.5"
              >
                {v}
                <button onClick={() => onChange(value.filter((x) => x !== v))}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
        </div>
      )}
      {allowAdd && (
        <div className="flex gap-2 mt-2">
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
            className="flex-1 px-3 py-2 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
          />
          <button
            onClick={add}
            className="size-9 rounded-xl bg-ink text-cream grid place-items-center"
            aria-label="Add"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
