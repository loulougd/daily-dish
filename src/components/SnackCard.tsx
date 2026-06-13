import { Apple } from "lucide-react";

interface Props {
  label: string;
  name: string;
  note: string;
}
export function SnackCard({ label, name, note }: Props) {
  return (
    <article className="bg-card rounded-2xl border border-stone-warm/50 p-4 flex items-start gap-3">
      <div className="size-11 shrink-0 rounded-xl bg-terracotta-soft grid place-items-center">
        <Apple className="size-5 text-terracotta" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45 mb-0.5">
          {label}
        </p>
        <h3 className="font-serif text-lg leading-tight">{name}</h3>
        <p className="text-xs text-ink/55 mt-1 leading-relaxed">{note}</p>
      </div>
    </article>
  );
}
