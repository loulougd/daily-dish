import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Calendar, Camera, Home, Settings as SettingsIcon, ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";
import { t } from "@/lib/strings";

const NAV = [
  { to: "/today", label: t.nav.today, Icon: Home },
  { to: "/week", label: t.nav.week, Icon: Calendar },
  { to: "/snap", label: t.nav.snap, Icon: Camera },
  { to: "/grocery", label: t.nav.grocery, Icon: ShoppingBasket },
  { to: "/my-recipes", label: t.nav.myRecipes, Icon: BookOpen },
  { to: "/settings", label: t.nav.settings, Icon: SettingsIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-md pb-28">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-stone-warm/70 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto max-w-md flex items-center justify-around px-1 pt-2 pb-5">
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 px-2 py-1 group"
              >
                <Icon
                  className={`size-5 transition-colors ${
                    active ? "text-sage" : "text-ink/40 group-hover:text-ink/70"
                  }`}
                  strokeWidth={1.75}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    active ? "text-sage" : "text-ink/50 group-hover:text-ink/80"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
