import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listExplore, listFeed } from "@/lib/server/fashion";
import { AvatarMark, ItemCard } from "@/components/item-card";

export const Route = createFileRoute("/_app/feed")({ component: FeedPage });

function FeedPage() {
  const feed = useQuery({ queryKey: ["feed"], queryFn: () => listFeed() });
  const explore = useQuery({ queryKey: ["explore"], queryFn: () => listExplore() });
  const posts = feed.data ?? [];
  const members = explore.data?.members ?? [];

  return (
    <div className="px-4 py-6">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Timeline</p>
      <h1 className="mt-1 font-display text-4xl">Following</h1>

      <div className="-mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-2">
        {members.map((m) => (
          <Link
            key={m.userId}
            to="/u/$userId"
            params={{ userId: m.userId }}
            className="flex w-16 shrink-0 flex-col items-center gap-1.5"
          >
            <AvatarMark name={m.displayName} hue={m.avatarHue} />
            <span className="w-full truncate text-center text-[11px] text-muted">@{m.username}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-8">
        {feed.isLoading ? (
          <div className="grid gap-4">
            <div className="aspect-4/5 animate-pulse rounded-lg bg-paper" />
          </div>
        ) : posts.length === 0 ? (
          <p className="py-12 text-sm leading-relaxed text-muted">
            Follow members from Explore to fill this timeline. Public pieces they choose will land here.
          </p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-lg bg-surface shadow-(--shadow-card)">
              <Link to="/item/$itemId" params={{ itemId: String(post.id) }}>
                <img src={post.imageUrl} alt={post.title} className="aspect-4/5 w-full object-cover" />
              </Link>
              <div className="flex items-start gap-3 px-4 py-4">
                <Link to="/u/$userId" params={{ userId: post.userId }}>
                  <AvatarMark name={post.authorName ?? "M"} hue={post.authorHue} size="sm" />
                </Link>
                <div className="min-w-0">
                  <h2 className="font-medium">{post.title}</h2>
                  <p className="text-xs text-muted">
                    @{post.authorUsername} · {post.brand} · {post.color}
                  </p>
                  {post.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">{post.description}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">From the grid</h2>
          <Link to="/explore" className="text-xs tracking-wide text-muted uppercase">
            Explore
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(explore.data?.items ?? []).slice(0, 6).map((item) => (
            <ItemCard key={item.id} item={item} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
