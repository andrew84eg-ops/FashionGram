import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { STARTER_CLOSET, type Item, type Outfit, type Profile, type ShopProduct } from "@/lib/fashion";
import { z } from "zod";

type ItemRow = {
  id: number;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  color: string;
  color_hex: string;
  brand: string;
  season: string;
  size: string;
  is_public: boolean;
  for_sale: boolean;
  for_rent: boolean;
  for_exchange: boolean;
  created_at: string;
  author_name?: string;
  author_username?: string;
  author_hue?: string;
};

function mapItem(r: ItemRow): Item {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    imageUrl: r.image_url,
    category: r.category,
    color: r.color,
    colorHex: r.color_hex,
    brand: r.brand,
    season: r.season,
    size: r.size,
    isPublic: Boolean(r.is_public),
    forSale: Boolean(r.for_sale),
    forRent: Boolean(r.for_rent),
    forExchange: Boolean(r.for_exchange),
    createdAt: String(r.created_at),
    authorName: r.author_name,
    authorUsername: r.author_username,
    authorHue: r.author_hue,
  };
}

function slugify(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);
  return `${base || "member"}${userId.replace(/[^a-z0-9]/gi, "").slice(-4)}`.slice(0, 18);
}

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ user_id: string; seeded: boolean; username: string; display_name: string }>`
      select user_id, seeded, username, display_name from profiles where user_id = ${context.userId}
    `;
    if (existing[0]?.seeded) {
      return { username: existing[0].username, displayName: existing[0].display_name };
    }

    const authUser = await sql<{ name: string; email: string }>`
      select "name", "email" from "user" where "id" = ${context.userId}
    `;
    const displayName = (authUser[0]?.name || "You").split("@")[0] || "You";
    const username = slugify(displayName, context.userId);

    if (!existing[0]) {
      await sql`
        insert into profiles (user_id, display_name, username, bio, seeded)
        values (${context.userId}, ${displayName}, ${username}, ${"Building a closet that tells the truth."}, false)
        on conflict (user_id) do nothing
      `;
    }

    const mine = await sql<{ c: number }>`select count(*)::int as c from items where user_id = ${context.userId}`;
    if (!mine[0] || mine[0].c === 0) {
      for (const piece of STARTER_CLOSET) {
        await sql`
          insert into items (
            user_id, title, description, image_url, category, color, color_hex, brand, season, size, is_public
          ) values (
            ${context.userId}, ${piece.title}, ${piece.description}, ${piece.imageUrl},
            ${piece.category}, ${piece.color}, ${piece.colorHex}, ${piece.brand}, ${piece.season}, ${piece.size}, false
          )
        `;
      }
    }

    const community = ["community-lina", "community-nour", "community-maya", "community-yasmine"];
    for (const id of community) {
      await sql`
        insert into follows (follower_id, following_id)
        values (${context.userId}, ${id})
        on conflict do nothing
      `;
    }

    await sql`update profiles set seeded = true where user_id = ${context.userId}`;
    const row = await sql<{ username: string; display_name: string }>`
      select username, display_name from profiles where user_id = ${context.userId}
    `;
    return { username: row[0]?.username ?? username, displayName: row[0]?.display_name ?? displayName };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      username: string;
      city: string;
      bio: string;
      avatar_hue: string;
      size_top: string;
      size_bottom: string;
      size_shoes: string;
    }>`select user_id, display_name, username, city, bio, avatar_hue, size_top, size_bottom, size_shoes
       from profiles where user_id = ${context.userId}`;
    const p = rows[0];
    if (!p) {
      return {
        userId: context.userId,
        displayName: "You",
        username: "you",
        city: "Cairo",
        bio: "",
        avatarHue: "22 18% 18%",
        sizeTop: "M",
        sizeBottom: "M",
        sizeShoes: "38",
        itemCount: 0,
        followerCount: 0,
        followingCount: 0,
      } satisfies Profile;
    }
    const counts = await sql<{ items: number; followers: number; following: number }>`
      select
        (select count(*)::int from items where user_id = ${context.userId}) as items,
        (select count(*)::int from follows where following_id = ${context.userId}) as followers,
        (select count(*)::int from follows where follower_id = ${context.userId}) as following
    `;
    return {
      userId: p.user_id,
      displayName: p.display_name,
      username: p.username,
      city: p.city,
      bio: p.bio,
      avatarHue: p.avatar_hue,
      sizeTop: p.size_top,
      sizeBottom: p.size_bottom,
      sizeShoes: p.size_shoes,
      itemCount: counts[0]?.items ?? 0,
      followerCount: counts[0]?.followers ?? 0,
      followingCount: counts[0]?.following ?? 0,
    } satisfies Profile;
  });

const profilePatch = z.object({
  displayName: z.string().min(1).max(40),
  username: z.string().min(2).max(20).regex(/^[a-z0-9._]+$/i),
  city: z.string().max(40),
  bio: z.string().max(180),
  sizeTop: z.string().max(8),
  sizeBottom: z.string().max(8),
  sizeShoes: z.string().max(8),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => profilePatch.parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update profiles set
        display_name = ${data.displayName},
        username = ${data.username.toLowerCase()},
        city = ${data.city},
        bio = ${data.bio},
        size_top = ${data.sizeTop},
        size_bottom = ${data.sizeBottom},
        size_shoes = ${data.sizeShoes}
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const listMyItems = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select * from items where user_id = ${context.userId} order by created_at desc
    `;
    return rows.map(mapItem);
  });

export const getItem = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: unknown) => z.number().int().parse(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, p.display_name as author_name, p.username as author_username, p.avatar_hue as author_hue
      from items i
      left join profiles p on p.user_id = i.user_id
      where i.id = ${id} and (i.user_id = ${context.userId} or i.is_public = true)
    `;
    return rows[0] ? mapItem(rows[0]) : null;
  });

const itemInput = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(400).default(""),
  imageUrl: z.string().min(1),
  category: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().min(1),
  brand: z.string().max(60).default(""),
  season: z.string().min(1),
  size: z.string().max(8).default(""),
  isPublic: z.boolean().default(false),
  forSale: z.boolean().default(false),
  forRent: z.boolean().default(false),
  forExchange: z.boolean().default(false),
});

export const addItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => itemInput.parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into items (
        user_id, title, description, image_url, category, color, color_hex,
        brand, season, size, is_public, for_sale, for_rent, for_exchange
      ) values (
        ${context.userId}, ${data.title}, ${data.description}, ${data.imageUrl},
        ${data.category}, ${data.color}, ${data.colorHex}, ${data.brand}, ${data.season},
        ${data.size}, ${data.isPublic}, ${data.forSale}, ${data.forRent}, ${data.forExchange}
      ) returning id
    `;
    return { id: rows[0].id };
  });

export const updateItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => itemInput.extend({ id: z.number().int() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update items set
        title = ${data.title},
        description = ${data.description},
        category = ${data.category},
        color = ${data.color},
        color_hex = ${data.colorHex},
        brand = ${data.brand},
        season = ${data.season},
        size = ${data.size},
        is_public = ${data.isPublic},
        for_sale = ${data.forSale},
        for_rent = ${data.forRent},
        for_exchange = ${data.forExchange}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => z.number().int().parse(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from outfit_items where item_id = ${id} and outfit_id in (select id from outfits where user_id = ${context.userId})`;
    await sql`delete from items where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const listFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, p.display_name as author_name, p.username as author_username, p.avatar_hue as author_hue
      from items i
      join profiles p on p.user_id = i.user_id
      where i.is_public = true
        and i.user_id <> ${context.userId}
        and i.user_id in (select following_id from follows where follower_id = ${context.userId})
      order by i.created_at desc
      limit 40
    `;
    return rows.map(mapItem);
  });

export const listExplore = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ItemRow>`
      select i.*, p.display_name as author_name, p.username as author_username, p.avatar_hue as author_hue
      from items i
      join profiles p on p.user_id = i.user_id
      where i.is_public = true and i.user_id <> ${context.userId}
      order by i.created_at desc
      limit 48
    `;
    const members = await sql<{
      user_id: string;
      display_name: string;
      username: string;
      city: string;
      avatar_hue: string;
      items: number;
    }>`
      select p.user_id, p.display_name, p.username, p.city, p.avatar_hue,
        (select count(*)::int from items where user_id = p.user_id and is_public = true) as items
      from profiles p
      where p.user_id <> ${context.userId}
      order by items desc
      limit 12
    `;
    return {
      items: rows.map(mapItem),
      members: members.map((m) => ({
        userId: m.user_id,
        displayName: m.display_name,
        username: m.username,
        city: m.city,
        avatarHue: m.avatar_hue,
        itemCount: m.items,
      })),
    };
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((userId: unknown) => z.string().min(1).parse(userId))
  .handler(async ({ context, data: userId }) => {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      username: string;
      city: string;
      bio: string;
      avatar_hue: string;
      size_top: string;
      size_bottom: string;
      size_shoes: string;
    }>`select user_id, display_name, username, city, bio, avatar_hue, size_top, size_bottom, size_shoes
       from profiles where user_id = ${userId}`;
    const p = rows[0];
    if (!p) return null;
    const counts = await sql<{ items: number; followers: number; following: number }>`
      select
        (select count(*)::int from items where user_id = ${userId} and is_public = true) as items,
        (select count(*)::int from follows where following_id = ${userId}) as followers,
        (select count(*)::int from follows where follower_id = ${userId}) as following
    `;
    const follow = await sql<{ n: number }>`
      select count(*)::int as n from follows where follower_id = ${context.userId} and following_id = ${userId}
    `;
    const items = await sql<ItemRow>`
      select * from items where user_id = ${userId} and is_public = true order by created_at desc
    `;
    const profile: Profile = {
      userId: p.user_id,
      displayName: p.display_name,
      username: p.username,
      city: p.city,
      bio: p.bio,
      avatarHue: p.avatar_hue,
      sizeTop: p.size_top,
      sizeBottom: p.size_bottom,
      sizeShoes: p.size_shoes,
      itemCount: counts[0]?.items ?? 0,
      followerCount: counts[0]?.followers ?? 0,
      followingCount: counts[0]?.following ?? 0,
      isFollowing: (follow[0]?.n ?? 0) > 0,
    };
    return { profile, items: items.map(mapItem) };
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((userId: unknown) => z.string().min(1).parse(userId))
  .handler(async ({ context, data: userId }) => {
    if (userId === context.userId) return { following: false };
    const sql = await getSql();
    const existing = await sql<{ n: number }>`
      select count(*)::int as n from follows where follower_id = ${context.userId} and following_id = ${userId}
    `;
    if ((existing[0]?.n ?? 0) > 0) {
      await sql`delete from follows where follower_id = ${context.userId} and following_id = ${userId}`;
      return { following: false };
    }
    await sql`insert into follows (follower_id, following_id) values (${context.userId}, ${userId})`;
    return { following: true };
  });

export const listOutfits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const outfits = await sql<{
      id: number;
      name: string;
      occasion: string;
      wear_date: string | null;
      notes: string;
      created_at: string;
    }>`select id, name, occasion, wear_date, notes, created_at from outfits where user_id = ${context.userId} order by wear_date desc nulls last, created_at desc`;
    const result: Outfit[] = [];
    for (const o of outfits) {
      const pieces = await sql<ItemRow & { slot: string }>`
        select i.*, oi.slot
        from outfit_items oi
        join items i on i.id = oi.item_id
        where oi.outfit_id = ${o.id}
      `;
      result.push({
        id: o.id,
        name: o.name,
        occasion: o.occasion,
        wearDate: o.wear_date,
        notes: o.notes,
        createdAt: String(o.created_at),
        pieces: pieces.map((p) => ({ slot: p.slot, item: mapItem(p) })),
      });
    }
    return result;
  });

const outfitInput = z.object({
  name: z.string().min(1).max(60),
  occasion: z.string().min(1),
  wearDate: z.string().nullable(),
  notes: z.string().max(200).default(""),
  pieces: z.array(z.object({ slot: z.string(), itemId: z.number().int() })).min(1),
});

export const saveOutfit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => outfitInput.parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owned = await sql<{ id: number }>`
      select id from items where user_id = ${context.userId}
    `;
    const allowed = new Set(owned.map((r) => r.id));
    const pieces = data.pieces.filter((p) => allowed.has(p.itemId));
    if (pieces.length === 0) throw new Error("Add pieces from your closet first");
    const rows = await sql<{ id: number }>`
      insert into outfits (user_id, name, occasion, wear_date, notes)
      values (${context.userId}, ${data.name}, ${data.occasion}, ${data.wearDate}, ${data.notes})
      returning id
    `;
    const id = rows[0].id;
    for (const p of pieces) {
      await sql`insert into outfit_items (outfit_id, item_id, slot) values (${id}, ${p.itemId}, ${p.slot})`;
    }
    return { id };
  });

export const deleteOutfit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: unknown) => z.number().int().parse(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from outfits where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

function mapProduct(r: {
  id: number;
  title: string;
  brand: string;
  category: string;
  color: string;
  color_hex: string;
  size_range: string;
  price_egp: number;
  image_url: string;
  shop_name: string;
  description: string;
}): ShopProduct {
  return {
    id: r.id,
    title: r.title,
    brand: r.brand,
    category: r.category,
    color: r.color,
    colorHex: r.color_hex,
    sizeRange: r.size_range,
    priceEgp: r.price_egp,
    imageUrl: r.image_url,
    shopName: r.shop_name,
    description: r.description,
  };
}

export const listShop = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<Parameters<typeof mapProduct>[0]>`select * from shop_products order by price_egp`;
    return rows.map(mapProduct);
  });

const lookInput = z.object({
  pieces: z.array(
    z.object({
      category: z.string(),
      color: z.string(),
      title: z.string(),
    }),
  ),
  closetSummary: z.array(
    z.object({
      category: z.string(),
      color: z.string(),
      title: z.string(),
    }),
  ),
});

export const completeLook = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => lookInput.parse(d))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const catalog = (await sql<Parameters<typeof mapProduct>[0]>`select * from shop_products`).map(mapProduct);
    const cats = new Set(data.pieces.map((p) => p.category));
    const colors = data.pieces.map((p) => p.color);
    const missing: string[] = [];
    if (![...cats].some((c) => c === "shoes")) missing.push("shoes");
    if (![...cats].some((c) => c === "outerwear")) missing.push("outerwear");
    if (![...cats].some((c) => c === "bag" || c === "accessory")) missing.push("bag");
    if (![...cats].some((c) => c === "bottom" || c === "dress")) missing.push("bottom");

    const scored = catalog
      .map((p) => {
        let score = 0;
        let reason = p.description;
        if (missing.includes(p.category) || (p.category === "bag" && missing.includes("bag"))) {
          score += 5;
          reason = `Your look has no ${p.category}. ${p.brand} has this in ${p.color}.`;
        }
        if (colors.includes("black") && (p.color === "camel" || p.color === "ivory" || p.color === "terracotta")) {
          score += 3;
          reason = `Breaks up a dark look with ${p.color}.`;
        }
        if (colors.includes("ivory") && p.category === "outerwear" && p.color === "burgundy") {
          score += 4;
          reason = "A burgundy blazer over an ivory blouse is the outfit the closet was missing.";
        }
        if (data.closetSummary.some((c) => c.category === p.category && c.color === p.color)) {
          score -= 3;
        }
        return { product: p, score, reason };
      })
      .sort((a, b) => b.score - a.score);

    let picks = scored.filter((s) => s.score > 0).slice(0, 3);
    if (picks.length === 0) picks = scored.slice(0, 3);

    const apiKey = process.env.XAI_API_KEY;
    if (apiKey && data.pieces.length > 0) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 220,
            messages: [
              {
                role: "system",
                content:
                  "You are a precise stylist for Egyptian wardrobes. Reply with a short JSON array of {id, reason} using only given shop ids. Max 3. No markdown.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  look: data.pieces,
                  closet: data.closetSummary,
                  shop: catalog.map((p) => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    color: p.color,
                    brand: p.brand,
                  })),
                }),
              },
            ],
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices: { message: { content: string } }[] };
          const text = body.choices[0]?.message.content ?? "";
          const match = text.match(/\[[\s\S]*\]/);
          if (match) {
            const parsed = JSON.parse(match[0]) as { id: number; reason: string }[];
            const byId = new Map(catalog.map((p) => [p.id, p]));
            const aiPicks = parsed
              .map((x) => {
                const product = byId.get(Number(x.id));
                return product ? { product, score: 10, reason: x.reason } : null;
              })
              .filter((x): x is NonNullable<typeof x> => Boolean(x))
              .slice(0, 3);
            if (aiPicks.length) picks = aiPicks;
          }
        }
      } catch {
        /* heuristic stands */
      }
    }

    return picks.map((p) => ({ product: p.product, reason: p.reason }));
  });

export const closetInsights = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ category: string; color: string; n: number }>`
      select category, color, count(*)::int as n from items where user_id = ${context.userId} group by category, color
    `;
    const byCategory: Record<string, number> = {};
    const byColor: Record<string, number> = {};
    for (const r of rows) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + r.n;
      byColor[r.color] = (byColor[r.color] ?? 0) + r.n;
    }
    const whiteTops = rows
      .filter((r) => r.category === "top" && (r.color === "ivory" || r.color === "white" || r.color === "cream"))
      .reduce((a, r) => a + r.n, 0);
    const gaps = ["shoes", "outerwear", "bag", "dress", "bottom", "top"].filter((c) => !byCategory[c]);
    return { byCategory, byColor, whiteTops, total: rows.reduce((a, r) => a + r.n, 0), gaps };
  });
