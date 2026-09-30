import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-dvh bg-bg px-5 py-4">
        <span className="font-display text-2xl tracking-tight">FashionGram</span>
      </div>
    );
  }
  if (user) return <Navigate to="/feed" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      window.location.href = "/feed";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-bg">
      <div className="mx-auto grid min-h-dvh max-w-5xl lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:block">
          <img
            src="/closet/blouse-white.jpg"
            alt="Ivory silk blouse"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-fg/25" />
          <p className="absolute bottom-10 left-10 right-10 font-display text-3xl leading-snug text-primary-fg">
            She bought a third white blouse because the closet could not speak.
          </p>
        </section>
        <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <Link to="/" className="font-display text-3xl tracking-tight">
            FashionGram
          </Link>
          <h1 className="mt-8 font-display text-4xl leading-none">Enter your closet.</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Photograph every piece. Mix looks. Stop buying what you already own.
          </p>

          {authEnabled ? (
            <div className="mt-8 flex max-w-sm flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  onClick={() => signIn(p.providerId, { callbackURL: "/feed" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
          )}

          <div className="my-6 max-w-sm text-center text-xs tracking-[0.2em] text-subtle uppercase">
            or email
          </div>

          <form onSubmit={onEmail} className="flex max-w-sm flex-col gap-3">
            {mode === "up" ? (
              <Field label="Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
            ) : null}
            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
              />
            </Field>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Working…" : mode === "up" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 max-w-sm text-left text-sm text-muted hover:text-fg"
            onClick={() => setMode(mode === "up" ? "in" : "up")}
          >
            {mode === "up" ? "Already a member? Sign in" : "New? Create an account"}
          </button>
        </section>
      </div>
    </main>
  );
}
