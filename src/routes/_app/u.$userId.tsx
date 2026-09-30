import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPublicProfile, toggleFollow } from "@/lib/server/fashion";
import { AvatarMark, ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/u/$userId")({ component: MemberPage });

function MemberPage() {
  const { userId } = Route.useParams();
  const me = useCurrentUser();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["member", userId],
    queryFn: () => getPublicProfile({ data: userId }),
  });
  const follow = useMutation({
    mutationFn: () => toggleFollow({ data: userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["member", userId] }),
  });

  const data = q.data;
  if (q.isLoading) return <div className="p-6 text-sm text-muted">Opening closet…</div>;
  if (!data) return <div className="p-6 text-sm text-muted">No such member.</div>;
  const { profile, items } = data;
  const mine = me?.id === profile.userId;

  return (
    <div className="px-4 py-6">
      <div className="flex items-start gap-4">
        <AvatarMark name={profile.displayName} hue={profile.avatarHue} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl leading-none">{profile.displayName}</h1>
          <p className="mt-1 text-sm text-muted">
            @{profile.username} · {profile.city}
          </p>
          {profile.bio ? <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p> : null}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface text-center">
        <div className="px-2 py-4">
          <dt className="text-[10px] tracking-wide text-muted uppercase">Public</dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">{profile.itemCount}</dd>
        </div>
        <div className="px-2 py-4">
          <dt className="text-[10px] tracking-wide text-muted uppercase">Followers</dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">{profile.followerCount}</dd>
        </div>
        <div className="px-2 py-4">
          <dt className="text-[10px] tracking-wide text-muted uppercase">Following</dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">{profile.followingCount}</dd>
        </div>
      </dl>

      {mine ? (
        <Link to="/me" className="mt-5 inline-block text-sm text-muted">
          This is you — edit profile
        </Link>
      ) : (
        <Button className="mt-5" type="button" variant={profile.isFollowing ? "secondary" : "primary"} onClick={() => follow.mutate()} disabled={follow.isPending}>
          {profile.isFollowing ? "Following" : "Follow"}
        </Button>
      )}

      <h2 className="mt-10 font-display text-3xl">Public pieces</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nothing public yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
