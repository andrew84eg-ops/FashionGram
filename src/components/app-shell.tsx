import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarRange, LayoutGrid, Shirt, Sparkles, UserRound } from "lucide-react";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/feed", label: "Feed", icon: LayoutGrid },
  { to: "/closet", label: "Closet", icon: Shirt },
  { to: "/room", label: "Room", icon: Sparkles },
  { to: "/looks", label: "Looks", icon: CalendarRange },
  { to: "/me", label: "You", icon: UserRound },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isPending } = useCurrentUserState();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg md:max-w-3xl lg:max-w-5xl">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <Link to="/feed" className="font-display text-2xl tracking-tight">
          FashionGram
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/shop" className="text-xs tracking-[0.18em] text-muted uppercase hover:text-fg">
            Shop
          </Link>
          {isPending ? (
            <div className="size-8 animate-pulse rounded-full bg-paper" />
          ) : (
            <SignedIn>
              <div className="max-w-[42vw] overflow-hidden [&_span.text-sm]:max-w-24 [&_span.text-sm]:truncate">
                <UserButton />
              </div>
            </SignedIn>
          )}
        </div>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 backdrop-blur-sm">
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] md:max-w-3xl lg:max-w-5xl">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] tracking-wide",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className={cn("size-5", item.to === "/room" && "size-6")} strokeWidth={active ? 2.2 : 1.7} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
