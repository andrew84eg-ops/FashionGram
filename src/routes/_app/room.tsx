import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { listMyItems, saveOutfit } from "@/lib/server/fashion";
import { FITTING_SLOTS, OCCASIONS, type FittingSlot, type Item } from "@/lib/fashion";
import { useLookDraft } from "@/lib/look-draft";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/room")({ component: RoomPage });

function RoomPage() {
  const itemsQ = useQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() });
  const items = itemsQ.data ?? [];
  const pieces = useLookDraft((s) => s.pieces);
  const setPiece = useLookDraft((s) => s.setPiece);
  const clear = useLookDraft((s) => s.clear);
  const [slot, setSlot] = useState<FittingSlot>("top");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("Everyday");
  const [wearDate, setWearDate] = useState("");
  const nav = useNavigate();

  const active = FITTING_SLOTS.find((s) => s.id === slot)!;
  const pool = items.filter((i) => (active.categories as readonly string[]).includes(i.category));
  const stacked = useMemo(() => {
    const order: FittingSlot[] = ["outerwear", "top", "dress", "bottom", "shoes", "extra"];
    return order.map((id) => pieces[id]).filter((x): x is Item => Boolean(x));
  }, [pieces]);

  async function onSave() {
    const selected = Object.entries(pieces).filter(([, v]) => v) as [FittingSlot, Item][];
    if (selected.length === 0) {
      toast.error("Pull at least one piece onto the board");
      return;
    }
    setSaving(true);
    try {
      await saveOutfit({
        data: {
          name: name || selected.map(([, i]) => i.title).slice(0, 2).join(" · "),
          occasion,
          wearDate: wearDate || null,
          notes: "",
          pieces: selected.map(([s, i]) => ({ slot: s, itemId: i.id })),
        },
      });
      toast.success("Look saved");
      clear();
      nav({ to: "/looks" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save look");
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Fitting room</p>
      <h1 className="mt-1 font-display text-4xl">Build a look</h1>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
        {stacked.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-2xl">Empty board</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Choose a slot, then tap a piece from the closet. Dress, trousers, shoes — see if they sit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-border">
            {stacked.map((item) => (
              <button
                key={item.id}
                type="button"
                className="bg-surface"
                onClick={() => {
                  const found = FITTING_SLOTS.find((s) =>
                    (s.categories as readonly string[]).includes(item.category),
                  );
                  if (found) setPiece(found.id, null);
                }}
              >
                <img src={item.imageUrl} alt={item.title} className="aspect-3/4 w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      {stacked.length > 0 ? (
        <p className="mt-2 text-xs text-muted">Tap a piece on the board to remove it.</p>
      ) : null}

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        {FITTING_SLOTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSlot(s.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-xs",
              slot === s.id ? "bg-primary text-primary-fg" : "border border-border bg-surface text-muted",
            )}
          >
            {s.label}
            {pieces[s.id] ? " ·" : ""}
          </button>
        ))}
      </div>

      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {pool.length === 0 ? (
          <p className="px-1 py-6 text-sm text-muted">No {active.label.toLowerCase()} in the closet yet.</p>
        ) : (
          pool.map((item) => {
            const on = pieces[slot]?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPiece(slot, on ? null : item)}
                className={cn("w-28 shrink-0 text-left", on && "opacity-100")}
              >
                <div className={cn("overflow-hidden rounded-md border", on ? "border-fg" : "border-transparent")}>
                  <img src={item.imageUrl} alt="" className="aspect-2/3 w-full object-cover" />
                </div>
                <p className="mt-1 truncate text-xs">{item.title}</p>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-8 space-y-3 rounded-lg border border-border bg-surface p-4">
        <Field label="Look name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuesday, downtown" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Occasion">
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            >
              {OCCASIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Wear date">
            <Input type="date" value={wearDate} onChange={(e) => setWearDate(e.target.value)} />
          </Field>
        </div>
        <Button type="button" onClick={() => void onSave()} disabled={saving}>
          {saving ? "Saving…" : "Save this look"}
        </Button>
        <Link to="/shop" className="block">
          <Button type="button" variant="secondary" className="w-full">
            Find the missing piece
          </Button>
        </Link>
      </div>
    </div>
  );
}
