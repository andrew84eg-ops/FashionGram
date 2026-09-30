import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user } = useCurrentUserState();
  if (user) return <Navigate to="/feed" />;
  return <Landing />;
}

function Landing() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="font-display text-2xl tracking-tight">FashionGram</span>
        <Link to="/login" className="text-sm text-muted hover:text-fg">
          Sign in
        </Link>
      </header>

      <section className="px-5 pb-10 pt-6 md:px-10 md:pt-16">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">A closet that remembers</p>
        <h1 className="mt-4 max-w-3xl font-display text-[2.75rem] leading-[0.95] md:text-7xl">
          Stop buying the white blouse you already own.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          A friend told us his wife bought a third white blouse because she forgot the two hanging
          in the wardrobe. That is not a shopping problem. It is a memory problem. FashionGram is
          the closet, photographed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login">
            <Button size="lg">Open your closet</Button>
          </Link>
          <a href="#story">
            <Button size="lg" variant="secondary">
              The idea
            </Button>
          </a>
        </div>
      </section>

      <section className="grid gap-2 px-5 md:grid-cols-3 md:px-10">
        <figure className="md:col-span-2">
          <img
            src="/closet/blouse-white.jpg"
            alt="Ivory silk blouse"
            className="h-[420px] w-full rounded-lg object-cover md:h-[560px]"
          />
          <figcaption className="mt-2 text-xs tracking-wide text-muted">
            Ivory silk. Photographed once.
          </figcaption>
        </figure>
        <div className="grid grid-rows-2 gap-2">
          <img src="/closet/trousers-black.jpg" alt="Black trousers" className="h-full w-full rounded-lg object-cover" />
          <img src="/closet/dress-slip.jpg" alt="Black slip dress" className="h-full w-full rounded-lg object-cover" />
        </div>
      </section>

      <section id="story" className="mx-auto max-w-3xl px-5 py-20 md:px-10">
        <h2 className="font-display text-4xl">How it works</h2>
        <ol className="mt-10 space-y-8">
          {[
            {
              n: "01",
              t: "Photograph the wardrobe",
              d: "Every piece, on a clean ground. Sort by color, season, brand, size. Public or private.",
            },
            {
              n: "02",
              t: "Build the look in the fitting room",
              d: "Pull pieces from the closet. See if they sit together. Save the outfit to a date and an occasion — so mornings stop being a negotiation.",
            },
            {
              n: "03",
              t: "Fill only the gap",
              d: "The app suggests the missing piece that completes a look, in the right color and size, from partner houses — not another white blouse.",
            },
            {
              n: "04",
              t: "Share on the timeline",
              d: "Members publish pieces they choose. Follow closets you trust. Keep the rest behind the door.",
            },
          ].map((s) => (
            <li key={s.n} className="grid grid-cols-[auto_1fr] gap-5">
              <span className="font-display text-2xl text-subtle">{s.n}</span>
              <div>
                <h3 className="text-lg font-medium">{s.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border px-5 py-16 md:px-10">
        <p className="max-w-2xl font-display text-3xl leading-snug md:text-4xl">
          The public face is a better closet. The honest work is knowing, piece by piece, what people
          already wear — so the next garment actually belongs.
        </p>
        <div className="mt-8">
          <Link to="/login">
            <Button size="lg">Begin with eight pieces</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
