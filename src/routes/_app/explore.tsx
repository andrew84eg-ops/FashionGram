import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listExplore } from "@/lib/server/fashion";
import { AvatarMark, ItemCard } from "@/components/item-card";

export const Route = createFileRoute("/_app/explore")({ component: ExplorePage });

function ExplorePage() {
  const q = useQuery({ queryKey: ["explore"], queryFn: () => listExplore() });
  const members = q.data?.members ?? [];
  const items = q.data?.items ?? [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Members</p>
      <h1 className="mt-1 font-display text-4xl">Explore</h1>

      <div className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-2">
        {members.map((m) => (
          <Link
            key={m.userId}
            to="/u/$userId"
            params={{ userId: m.userId }}
            className="flex min-w-36 shrink-0 flex-col gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <AvatarMark name={m.displayName} hue={m.avatarHue} />
            <div>
              <p className="text-sm font-medium">{m.displayName}</p>
              <p className="text-xs text-muted">
                @{m.username} · {m.city}
              </p>
              <p className="mt-1 text-xs text-subtle">{m.itemCount} public</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 font-display text-3xl">Recent pieces</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
