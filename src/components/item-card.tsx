import { Link } from "@tanstack/react-router";
import type { Item } from "@/lib/fashion";
import { cn } from "@/lib/utils";

export function ItemCard({
  item,
  compact,
}: {
  item: Item;
  compact?: boolean;
}) {
  return (
    <Link
      to="/item/$itemId"
      params={{ itemId: String(item.id) }}
      className="block text-left"
    >
      <div className="relative overflow-hidden rounded-md bg-paper aspect-2/3">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover"
        />
        {item.isPublic ? (
          <span className="absolute left-2 top-2 rounded-sm bg-surface/90 px-1.5 py-0.5 text-[10px] tracking-wide text-muted">
            Public
          </span>
        ) : null}
      </div>
      {compact ? null : (
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted">
              {item.brand || item.category}
            </p>
          </div>
          <span
            className="mt-1 size-3 shrink-0 rounded-full border border-border"
            style={{ background: item.colorHex }}
            title={item.color}
          />
        </div>
      )}
    </Link>
  );
}

export function AvatarMark({
  name,
  hue,
  size = "md",
}: {
  name: string;
  hue?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-16 text-lg" : "size-11 text-xs";
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-fg font-medium text-primary-fg",
        dim,
      )}
      style={hue ? { background: `hsl(${hue})` } : undefined}
    >
      {letters}
    </span>
  );
}
