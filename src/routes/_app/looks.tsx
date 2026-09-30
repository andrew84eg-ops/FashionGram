import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { listOutfits, deleteOutfit } from "@/lib/server/fashion";
import { useLookDraft } from "@/lib/look-draft";
import { FITTING_SLOTS, type FittingSlot } from "@/lib/fashion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/looks")({ component: LooksPage });

function LooksPage() {
  const q = useQuery({ queryKey: ["outfits"], queryFn: () => listOutfits() });
  const qc = useQueryClient();
  const load = useLookDraft((s) => s.loadPieces);
  const nav = useNavigate();
  const del = useMutation({
    mutationFn: (id: number) => deleteOutfit({ data: id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outfits"] }),
  });

  const looks = q.data ?? [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Calendar</p>
      <h1 className="mt-1 font-display text-4xl">Looks</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Saved outfits, dated. So the morning before you leave is already decided.
      </p>

      {q.isLoading ? (
        <div className="mt-8 h-40 animate-pulse rounded-lg bg-paper" />
      ) : looks.length === 0 ? (
        <p className="py-16 text-sm text-muted">No looks yet. Build one in the fitting room.</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {looks.map((look) => (
            <li key={look.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="grid grid-cols-4">
                {look.pieces.slice(0, 4).map((p) => (
                  <img key={p.slot} src={p.item.imageUrl} alt="" className="aspect-square object-cover" />
                ))}
              </div>
              <div className="px-4 py-4">
                <p className="text-xs tracking-wide text-muted uppercase">{look.occasion}</p>
                <h2 className="font-display text-2xl">{look.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {look.wearDate ? format(parseISO(String(look.wearDate).slice(0, 10)), "EEEE d MMMM") : "No date yet"}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      const next: Partial<Record<FittingSlot, (typeof look.pieces)[0]["item"]>> = {};
                      for (const p of look.pieces) {
                        const slot = FITTING_SLOTS.find((s) => s.id === p.slot);
                        if (slot) next[slot.id] = p.item;
                      }
                      load(next);
                      nav({ to: "/room" });
                    }}
                  >
                    Open in room
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => del.mutate(look.id)}
                    disabled={del.isPending}
                  >
                    Drop
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
