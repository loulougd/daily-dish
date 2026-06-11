import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/strings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Forkcast" },
      { name: "description", content: "Edit your goal, preferences, and cycle tracking." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, update, reset } = useProfile();
  const navigate = useNavigate();

  const fmtGoal = (g: typeof profile.goal) =>
    t.onboarding.goal.options[g]?.label ?? g;
  const fmtGuidance = (g: typeof profile.guidance) =>
    g === "calories" ? "Calories & macros" : "Visual portions";
  const fmtTime = (tb: typeof profile.time) => t.onboarding.time.options[tb];
  const fmtEffort = (e: typeof profile.effort) =>
    t.onboarding.effort.options[e]?.label ?? e;
  const fmtBudget = (b: typeof profile.budget) =>
    t.onboarding.budget.options[b]?.label ?? b;

  return (
    <AppShell>
      <header className="px-6 pt-10 pb-5">
        <p className="eyebrow text-terracotta mb-2">Forkcast</p>
        <h1 className="font-serif text-4xl leading-tight">{t.settings.title}</h1>
      </header>

      <section className="px-6">
        <p className="eyebrow text-ink/55 mb-2">{t.settings.preferences}</p>
        <div className="bg-card border border-stone-warm rounded-2xl divide-y divide-stone-warm/70 overflow-hidden">
          <Row label={t.settings.editGoal} value={fmtGoal(profile.goal)} />
          <Row label={t.settings.editGuidance} value={fmtGuidance(profile.guidance)} />
          <Row label={t.settings.editTime} value={fmtTime(profile.time)} />
          <Row label={t.settings.editEffort} value={fmtEffort(profile.effort)} />
          <Row
            label={t.settings.editDiet}
            value={profile.diet.length ? profile.diet.join(", ") : "None"}
          />
          <Row
            label={t.settings.editHated}
            value={profile.hated.length ? profile.hated.join(", ") : "None"}
          />
          <Row label={t.settings.editBudget} value={fmtBudget(profile.budget)} />
          <Row
            label={t.settings.editHousehold}
            value={`${profile.household} ${profile.household === 1 ? "person" : "people"}`}
          />
          <Row label={t.settings.editCity} value={profile.city} />
        </div>
      </section>

      <section className="px-6 mt-8">
        <p className="eyebrow text-ink/55 mb-2">{t.settings.cycle}</p>
        <div className="bg-card border border-stone-warm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink">Enabled</span>
            <button
              onClick={() =>
                update({ cycle: { ...profile.cycle, enabled: !profile.cycle.enabled } })
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${
                profile.cycle.enabled ? "bg-sage" : "bg-stone-warm"
              }`}
              aria-pressed={profile.cycle.enabled}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-cream transition-transform ${
                  profile.cycle.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
          {profile.cycle.enabled && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs text-ink/55 block mb-1">
                  {t.onboarding.cycle.lastPeriod}
                </span>
                <input
                  type="date"
                  value={profile.cycle.lastPeriodISO ?? ""}
                  onChange={(e) =>
                    update({
                      cycle: { ...profile.cycle, lastPeriodISO: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink/55 block mb-1">
                  {t.onboarding.cycle.cycleLength}
                </span>
                <input
                  type="number"
                  min={20}
                  max={40}
                  value={profile.cycle.cycleLength || 28}
                  onChange={(e) =>
                    update({
                      cycle: {
                        ...profile.cycle,
                        cycleLength: Number(e.target.value) || 28,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-cream border border-stone-warm text-sm outline-none"
                />
              </label>
            </div>
          )}
          <p className="text-[11px] text-ink/50 italic mt-3 leading-relaxed">
            {t.settings.cycleDisclaimer}
          </p>
        </div>
      </section>

      <section className="px-6 mt-8 space-y-3">
        <Link
          to="/premium"
          className="block w-full py-3.5 rounded-2xl bg-terracotta text-cream text-sm font-semibold text-center"
        >
          {t.settings.upgrade}
        </Link>
        <button
          onClick={() => {
            reset();
            navigate({ to: "/onboarding" });
          }}
          className="block w-full py-3.5 rounded-2xl border border-stone-warm text-ink/60 text-sm font-semibold"
        >
          {t.settings.reset}
        </button>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-ink/70">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-ink text-right truncate max-w-[180px]">
          {value}
        </span>
        <ChevronRight className="size-4 text-ink/30 shrink-0" />
      </div>
    </div>
  );
}
