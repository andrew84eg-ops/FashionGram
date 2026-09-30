import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { addItem, closetInsights, listMyItems } from "@/lib/server/fashion";
import { BRANDS, CATEGORIES, COLORS, SEASONS } from "@/lib/fashion";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/add")({ component: AddPage });

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 720;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function AddPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("top");
  const [color, setColor] = useState("black");
  const [brand, setBrand] = useState("Other");
  const [season, setSeason] = useState("all");
  const [size, setSize] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [forSale, setForSale] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dupWarn, setDupWarn] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const url = await compressImage(file);
    setImageUrl(url);
  }

  async function onColor(next: string) {
    setColor(next);
    const items = (await qc.fetchQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() })) ?? [];
    const insights = await qc.fetchQuery({ queryKey: ["insights"], queryFn: () => closetInsights() });
    if ((next === "ivory" || next === "white") && category === "top" && insights.whiteTops >= 1) {
      const names = items
        .filter((i) => i.category === "top" && (i.color === "ivory" || i.color === "white"))
        .map((i) => i.title);
      setDupWarn(`You already have ${names.join(", ") || "a white top"} in the closet.`);
    } else {
      setDupWarn(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Add a photograph first");
      return;
    }
    setBusy(true);
    try {
      const meta = COLORS.find((c) => c.id === color);
      await addItem({
        data: {
          title,
          description,
          imageUrl,
          category,
          color,
          colorHex: meta?.hex ?? "#1A1614",
          brand,
          season,
          size,
          isPublic,
          forSale,
          forRent: false,
          forExchange: false,
        },
      });
      await qc.invalidateQueries();
      toast.success("Hung in the closet");
      nav({ to: "/closet" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">New piece</p>
      <h1 className="mt-1 font-display text-4xl">Add item</h1>

      <label className="mt-6 flex aspect-2/3 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-paper">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-6 text-center text-sm text-muted">Tap to photograph or choose from the roll</span>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </label>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="Title">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ivory silk blouse" />
        </Field>
        <Field label="Notes">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Where it lives, how it sits." />
        </Field>
        <Field label="Category">
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => void onColor(c.id)}
                className={cn("size-8 rounded-full border", color === c.id ? "border-fg" : "border-border")}
                style={{ background: c.hex }}
                aria-label={c.label}
              />
            ))}
          </div>
          {dupWarn ? <p className="mt-2 text-sm text-danger">{dupWarn}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand">
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              {BRANDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Season">
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              {SEASONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Size">
          <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="M" />
        </Field>
        <label className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-3 text-sm">
          Public on the timeline
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-3 text-sm">
          Listed for sale
          <input type="checkbox" checked={forSale} onChange={(e) => setForSale(e.target.checked)} />
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Hang it up"}
        </Button>
      </div>
    </form>
  );
}
