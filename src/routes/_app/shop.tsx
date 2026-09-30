import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { completeLook, listMyItems, listShop } from "@/lib/server/fashion";
import { useLookDraft } from "@/lib/look-draft";
import { formatEgp } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/fashion";

export const Route = createFileRoute("/_app/shop")({ component: ShopPage });

function ShopPage() {
  const shopQ = useQuery({ queryKey: ["shop"], queryFn: () => listShop() });
  const itemsQ = useQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() });
  const pieces = useLookDraft((s) => s.pieces);
  const lookPieces = Object.values(pieces).filter(Boolean);
  const suggest = useMutation({
    mutationFn: () =>
      completeLook({
        data: {
          pieces: lookPieces.map((p) => ({
            category: p!.category,
            color: p!.color,
            title: p!.title,
          })),
          closetSummary: (itemsQ.data ?? []).map((p) => ({
            category: p.category,
            color: p.color,
            title: p.title,
          })),
        },
      }),
  });

  const suggestions = suggest.data;
  const products = shopQ.data ?? [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Partner houses</p>
      <h1 className="mt-1 font-display text-4xl">The missing piece</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        Suggestions are sized and colored against what is already hanging. Not another white blouse.
      </p>

      <div className="mt-5 rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          {lookPieces.length
            ? `Current board: ${lookPieces.map((p) => p!.title).join(" · ")}`
            : "Build a look in the fitting room, then ask for the gap."}
        </p>
        <Button
          className="mt-3"
          type="button"
          onClick={() => suggest.mutate()}
          disabled={suggest.isPending}
        >
          {suggest.isPending ? "Reading the closet…" : "Complete this look"}
        </Button>
      </div>

      {suggestions?.length ? (
        <section className="mt-8">
          <h2 className="font-display text-3xl">For this look</h2>
          <ul className="mt-4 space-y-4">
            {suggestions.map((s) => (
              <li key={s.product.id} className="grid grid-cols-[7rem_1fr] gap-3 overflow-hidden rounded-lg border border-border bg-surface">
                <img src={s.product.imageUrl} alt="" className="h-full object-cover" />
                <div className="py-3 pr-3">
                  <p className="text-xs text-muted">
                    {s.product.brand} · {formatEgp(s.product.priceEgp)}
                  </p>
                  <h3 className="font-medium">{s.product.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.reason}</p>
                  <p className="mt-2 text-xs text-subtle">
                    {s.product.shopName} · {s.product.sizeRange}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-3xl">The rack</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => (
            <article key={p.id}>
              <div className="overflow-hidden rounded-md bg-paper aspect-2/3">
                <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-xs tracking-wide text-muted uppercase">
                {categoryLabel(p.category)}
              </p>
              <h3 className="text-sm font-medium">{p.title}</h3>
              <p className="text-xs text-muted">
                {p.brand} · {formatEgp(p.priceEgp)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
