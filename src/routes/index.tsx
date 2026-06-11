import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { profile, hydrated } = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream">
        <p className="font-serif italic text-2xl text-ink/40">Forkcast</p>
      </div>
    );
  }
  return <Navigate to={profile.onboarded ? "/today" : "/onboarding"} replace />;
}
