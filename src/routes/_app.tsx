import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/app-shell";
import { ensureProfile } from "@/lib/server/fashion";

export const Route = createFileRoute("/_app")({
  component: GuardedShell,
});

function GuardedShell() {
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (user) void ensureProfile();
  }, [user]);

  if (isPending) {
    return (
      <div className="min-h-dvh bg-bg px-5 py-4">
        <span className="font-display text-2xl tracking-tight">FashionGram</span>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <AppShell />;
}
