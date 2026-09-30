create table if not exists profiles (
  user_id text primary key,
  display_name text not null,
  username text not null,
  city text not null default 'Cairo',
  bio text not null default '',
  avatar_hue text not null default '22 18% 18%',
  size_top text not null default 'M',
  size_bottom text not null default 'M',
  size_shoes text not null default '38',
  seeded boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_username_idx on profiles (username);

create table if not exists items (
  id serial primary key,
  user_id text not null,
  title text not null,
  description text not null default '',
  image_url text not null,
  category text not null,
  color text not null,
  color_hex text not null,
  brand text not null default '',
  season text not null default 'all',
  size text not null default '',
  is_public boolean not null default false,
  for_sale boolean not null default false,
  for_rent boolean not null default false,
  for_exchange boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists items_user_id_idx on items (user_id);
create index if not exists items_public_idx on items (is_public, created_at desc);

create table if not exists outfits (
  id serial primary key,
  user_id text not null,
  name text not null,
  occasion text not null default 'Everyday',
  wear_date date,
  notes text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists outfits_user_id_idx on outfits (user_id);

create table if not exists outfit_items (
  outfit_id int not null references outfits(id) on delete cascade,
  item_id int not null,
  slot text not null,
  primary key (outfit_id, slot)
);

create table if not exists follows (
  follower_id text not null,
  following_id text not null,
  primary key (follower_id, following_id)
);
create index if not exists follows_follower_idx on follows (follower_id);

create table if not exists shop_products (
  id serial primary key,
  title text not null,
  brand text not null,
  category text not null,
  color text not null,
  color_hex text not null,
  size_range text not null default 'XS–XL',
  price_egp int not null,
  image_url text not null,
  shop_name text not null,
  description text not null default ''
);
