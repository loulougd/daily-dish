interface Props {
  label: string;
  value: string;
  accent?: boolean;
}
export function ContextChip({ label, value, accent }: Props) {
  return (
    <div
      className={`flex-shrink-0 flex flex-col gap-0.5 px-4 py-2.5 rounded-2xl border ${
        accent
          ? "bg-terracotta-soft border-terracotta/20"
          : "bg-card border-stone-warm/70"
      }`}
    >
      <span className="eyebrow text-ink/40">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-terracotta" : "text-ink"}`}>{value}</span>
    </div>
  );
}
