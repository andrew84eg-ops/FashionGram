import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { closetInsights, listMyItems } from "@/lib/server/fashion";
import { CATEGORIES, COLORS } from "@/lib/fashion";
import { ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/closet")({ component: ClosetPage });

function ClosetPage() {
  const itemsQ = useQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() });
  const insightQ = useQuery({ queryKey: ["insights"], queryFn: () => closetInsights() });
  const [cat, setCat] = useState<string>("all");
  const [color, setColor] = useState<string>("all");
  const items = itemsQ.data ?? [];
  const filtered = useMemo(
    () =>
      items.filter((i) => (cat === "all" || i.category === cat) && (color === "all" || i.color === color)),
    [items, cat, color],
  );
  const insights = insightQ.data;

  return (
    <div className="px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Wardrobe</p>
          <h1 className="mt-1 font-display text-4xl">Closet</h1>
        </div>
        <Link to="/add">
          <Button size="sm">
            <Plus className="size-4" />
            Add
          </Button>
        </Link>
      </div>

      {insights ? (
        <div className="mt-5 rounded-lg border border-border bg-surface px-4 py-4">
          <p className="text-sm leading-relaxed text-muted">
            {insights.total} pieces.
            {insights.whiteTops > 0 ? (
              <>
                {" "}
                You already have <span className="text-fg">{insights.whiteTops} ivory/white top{insights.whiteTops > 1 ? "s" : ""}</span>
                {insights.whiteTops >= 2 ? " — the original problem, solved." : "."}
              </>
            ) : null}
            {insights.gaps.length ? (
              <>
                {" "}
                Missing {insights.gaps.join(", ")}.
              </>
            ) : null}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(insights.byColor).map(([c, n]) => {
              const meta = COLORS.find((x) => x.id === c);
              return (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-[11px] text-muted">
                  <span className="size-2 rounded-full border border-border" style={{ background: meta?.hex ?? "#ccc" }} />
                  {c} {n}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>
      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={color === "all"} onClick={() => setColor("all")}>
          Any color
        </Chip>
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setColor(c.id)}
            className={cn(
              "size-8 shrink-0 rounded-full border",
              color === c.id ? "border-fg" : "border-border",
            )}
            style={{ background: c.hex }}
            aria-label={c.label}
          />
        ))}
      </div>

      {itemsQ.isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-md bg-paper" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">Nothing in this drawer yet.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-3 text-xs",
        active ? "bg-primary text-primary-fg" : "border border-border bg-surface text-muted",
      )}
    >
      {children}
    </button>
  );
}
