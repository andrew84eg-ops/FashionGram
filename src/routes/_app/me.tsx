import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ensureProfile, getMyProfile, listMyItems, updateProfile } from "@/lib/server/fashion";
import { SIZES_BOTTOM, SIZES_SHOES, SIZES_TOP } from "@/lib/fashion";
import { AvatarMark, ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/me")({ component: MePage });

function MePage() {
  const user = useCurrentUser();
  const qc = useQueryClient();
  const profileQ = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      await ensureProfile();
      return getMyProfile();
    },
  });
  const itemsQ = useQuery({ queryKey: ["my-items"], queryFn: () => listMyItems() });
  const p = profileQ.data;
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [sizeTop, setSizeTop] = useState("M");
  const [sizeBottom, setSizeBottom] = useState("M");
  const [sizeShoes, setSizeShoes] = useState("38");

  useEffect(() => {
    if (!p) return;
    setDisplayName(p.displayName === "You" ? user?.displayName || p.displayName : p.displayName);
    setUsername(p.username);
    setCity(p.city);
    setBio(p.bio);
    setSizeTop(p.sizeTop);
    setSizeBottom(p.sizeBottom);
    setSizeShoes(p.sizeShoes);
  }, [p, user]);

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        data: { displayName, username, city, bio, sizeTop, sizeBottom, sizeShoes },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
      toast.success("Profile saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  if (!p) return <div className="p-6 text-sm text-muted">Opening your closet…</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex items-start gap-4">
        <AvatarMark name={p.displayName} hue={p.avatarHue} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl leading-none">{p.displayName}</h1>
          <p className="mt-1 text-sm text-muted">
            @{p.username} · {p.city}
          </p>
          {p.bio ? <p className="mt-3 text-sm leading-relaxed">{p.bio}</p> : null}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface text-center">
        <Stat n={p.itemCount} label="Pieces" />
        <Stat n={p.followerCount} label="Followers" />
        <Stat n={p.followingCount} label="Following" />
      </dl>

      <p className="mt-4 text-xs tracking-wide text-muted uppercase">
        Sizes · top {p.sizeTop} · bottom {p.sizeBottom} · shoes {p.sizeShoes}
      </p>

      <Button className="mt-5" variant="secondary" type="button" onClick={() => setEditing((v) => !v)}>
        {editing ? "Close" : "Edit profile"}
      </Button>

      {editing ? (
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Field label="Name">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </Field>
          <Field label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} required />
          </Field>
          <Field label="City">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="Bio">
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Top">
              <select
                className="h-11 w-full rounded-md border border-border bg-surface px-2 text-sm"
                value={sizeTop}
                onChange={(e) => setSizeTop(e.target.value)}
              >
                {SIZES_TOP.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Bottom">
              <select
                className="h-11 w-full rounded-md border border-border bg-surface px-2 text-sm"
                value={sizeBottom}
                onChange={(e) => setSizeBottom(e.target.value)}
              >
                {SIZES_BOTTOM.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Shoes">
              <select
                className="h-11 w-full rounded-md border border-border bg-surface px-2 text-sm"
                value={sizeShoes}
                onChange={(e) => setSizeShoes(e.target.value)}
              >
                {SIZES_SHOES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </form>
      ) : null}

      <div className="mt-10 flex items-end justify-between">
        <h2 className="font-display text-3xl">Your pieces</h2>
        <Link to="/closet" className="text-xs tracking-wide text-muted uppercase">
          Closet
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(itemsQ.data ?? []).slice(0, 6).map((item) => (
          <ItemCard key={item.id} item={item} compact />
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="px-2 py-4">
      <dt className="text-[10px] tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-2xl tabular-nums">{n}</dd>
    </div>
  );
}
