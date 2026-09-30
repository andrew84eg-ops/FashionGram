import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteItem, getItem, updateItem } from "@/lib/server/fashion";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { FITTING_SLOTS, categoryLabel } from "@/lib/fashion";
import { useLookDraft } from "@/lib/look-draft";
import { AvatarMark } from "@/components/item-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/item/$itemId")({ component: ItemPage });

function ItemPage() {
  const { itemId } = Route.useParams();
  const id = Number(itemId);
  const user = useCurrentUser();
  const nav = useNavigate();
  const qc = useQueryClient();
  const setPiece = useLookDraft((s) => s.setPiece);
  const q = useQuery({ queryKey: ["item", id], queryFn: () => getItem({ data: id }) });
  const item = q.data;

  const del = useMutation({
    mutationFn: () => deleteItem({ data: id }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success("Removed from the closet");
      nav({ to: "/closet" });
    },
  });

  if (q.isLoading) return <div className="p-6 text-sm text-muted">Loading piece…</div>;
  if (!item) return <div className="p-6 text-sm text-muted">This piece is private or gone.</div>;

  const mine = user?.id === item.userId;
  const slot = FITTING_SLOTS.find((s) => (s.categories as readonly string[]).includes(item.category));

  return (
    <article className="pb-8">
      <img src={item.imageUrl} alt={item.title} className="aspect-2/3 w-full object-cover" />
      <div className="px-4 pt-5">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">
          {categoryLabel(item.category)} · {item.season}
        </p>
        <h1 className="mt-1 font-display text-4xl">{item.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {item.brand}
          {item.size ? ` · size ${item.size}` : null}
        </p>
        {item.description ? <p className="mt-4 text-sm leading-relaxed">{item.description}</p> : null}

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="size-3 rounded-full border border-border" style={{ background: item.colorHex }} />
          <span className="capitalize">{item.color}</span>
          {item.isPublic ? <span className="text-muted">· Public</span> : <span className="text-muted">· Private</span>}
        </div>

        {!mine && item.authorName ? (
          <Link to="/u/$userId" params={{ userId: item.userId }} className="mt-5 flex items-center gap-3">
            <AvatarMark name={item.authorName} hue={item.authorHue} size="sm" />
            <span>
              <span className="block text-sm font-medium">{item.authorName}</span>
              <span className="text-xs text-muted">@{item.authorUsername}</span>
            </span>
          </Link>
        ) : null}

        <div className="mt-6 flex flex-col gap-2">
          {mine && slot ? (
            <Button
              type="button"
              onClick={() => {
                setPiece(slot.id, item);
                nav({ to: "/room" });
              }}
            >
              Add to fitting room
            </Button>
          ) : null}
          {mine ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void updateItem({
                    data: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      imageUrl: item.imageUrl,
                      category: item.category,
                      color: item.color,
                      colorHex: item.colorHex,
                      brand: item.brand,
                      season: item.season,
                      size: item.size,
                      isPublic: !item.isPublic,
                      forSale: item.forSale,
                      forRent: item.forRent,
                      forExchange: item.forExchange,
                    },
                  }).then(async () => {
                    await qc.invalidateQueries();
                    toast.success(item.isPublic ? "Now private" : "Now public");
                  });
                }}
              >
                {item.isPublic ? "Make private" : "Publish to timeline"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => del.mutate()} disabled={del.isPending}>
                Remove from closet
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
