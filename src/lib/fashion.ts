export const CATEGORIES = [
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "dress", label: "Dresses" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "bag", label: "Bags" },
  { id: "accessory", label: "Accessories" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const COLORS = [
  { id: "ivory", label: "Ivory", hex: "#F4EFE6" },
  { id: "white", label: "White", hex: "#F7F4EE" },
  { id: "cream", label: "Cream", hex: "#E8DCC8" },
  { id: "beige", label: "Beige", hex: "#C4A574" },
  { id: "tan", label: "Tan", hex: "#A67C54" },
  { id: "camel", label: "Camel", hex: "#C49A62" },
  { id: "brown", label: "Brown", hex: "#5C3A24" },
  { id: "black", label: "Black", hex: "#1A1614" },
  { id: "navy", label: "Navy", hex: "#2C3A4E" },
  { id: "olive", label: "Olive", hex: "#5A6648" },
  { id: "terracotta", label: "Terracotta", hex: "#C45C3A" },
  { id: "burgundy", label: "Burgundy", hex: "#5C242A" },
  { id: "grey", label: "Grey", hex: "#8A827A" },
] as const;

export const SEASONS = [
  { id: "all", label: "All year" },
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "fall", label: "Fall" },
  { id: "winter", label: "Winter" },
] as const;

export const BRANDS = [
  "Maison Heliopolis",
  "Atelier Nil",
  "Casa Linen",
  "Kojak Studio",
  "Tailor Row",
  "Winter Arc",
  "Cairo Last",
  "Field Notes",
  "Rain Line",
  "Other",
] as const;

export const OCCASIONS = [
  "Everyday",
  "Work",
  "Weekend",
  "Date night",
  "Wedding",
  "Eid",
  "Travel",
] as const;

export const SIZES_TOP = ["XS", "S", "M", "L", "XL"] as const;
export const SIZES_BOTTOM = ["XS", "S", "M", "L", "XL", "36", "38", "40", "42"] as const;
export const SIZES_SHOES = ["36", "37", "38", "39", "40", "41"] as const;

export const FITTING_SLOTS = [
  { id: "outerwear", label: "Layer", categories: ["outerwear"] },
  { id: "top", label: "Top", categories: ["top"] },
  { id: "dress", label: "Dress", categories: ["dress"] },
  { id: "bottom", label: "Bottom", categories: ["bottom"] },
  { id: "shoes", label: "Shoes", categories: ["shoes"] },
  { id: "extra", label: "Extra", categories: ["bag", "accessory"] },
] as const;

export type FittingSlot = (typeof FITTING_SLOTS)[number]["id"];

export type Item = {
  id: number;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: CategoryId | string;
  color: string;
  colorHex: string;
  brand: string;
  season: string;
  size: string;
  isPublic: boolean;
  forSale: boolean;
  forRent: boolean;
  forExchange: boolean;
  createdAt: string;
  authorName?: string;
  authorUsername?: string;
  authorHue?: string;
};

export type Outfit = {
  id: number;
  name: string;
  occasion: string;
  wearDate: string | null;
  notes: string;
  createdAt: string;
  pieces: { slot: string; item: Item }[];
};

export type ShopProduct = {
  id: number;
  title: string;
  brand: string;
  category: string;
  color: string;
  colorHex: string;
  sizeRange: string;
  priceEgp: number;
  imageUrl: string;
  shopName: string;
  description: string;
};

export type Profile = {
  userId: string;
  displayName: string;
  username: string;
  city: string;
  bio: string;
  avatarHue: string;
  sizeTop: string;
  sizeBottom: string;
  sizeShoes: string;
  itemCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
};

export const STARTER_CLOSET: Omit<Item, "id" | "userId" | "createdAt" | "isPublic" | "forSale" | "forRent" | "forExchange">[] = [
  {
    title: "Ivory Silk Blouse",
    description: "The blouse you already own. Photograph it once so you never buy it again.",
    imageUrl: "/closet/blouse-white.jpg",
    category: "top",
    color: "ivory",
    colorHex: "#F4EFE6",
    brand: "Maison Heliopolis",
    season: "all",
    size: "M",
  },
  {
    title: "Black Turtleneck",
    description: "Fine merino. The winter spine of a closet.",
    imageUrl: "/closet/turtleneck-black.jpg",
    category: "top",
    color: "black",
    colorHex: "#1A1614",
    brand: "Tailor Row",
    season: "winter",
    size: "M",
  },
  {
    title: "Cream Cashmere",
    description: "Quiet luxury. Goes under the camel coat.",
    imageUrl: "/closet/sweater-cream.jpg",
    category: "top",
    color: "cream",
    colorHex: "#E8DCC8",
    brand: "Atelier Nil",
    season: "winter",
    size: "M",
  },
  {
    title: "Black Trousers",
    description: "Sharp crease. Work to dinner.",
    imageUrl: "/closet/trousers-black.jpg",
    category: "bottom",
    color: "black",
    colorHex: "#1A1614",
    brand: "Tailor Row",
    season: "all",
    size: "M",
  },
  {
    title: "Light Straight Jean",
    description: "The weekend leg.",
    imageUrl: "/closet/jeans-light.jpg",
    category: "bottom",
    color: "navy",
    colorHex: "#7A93B0",
    brand: "Field Notes",
    season: "all",
    size: "M",
  },
  {
    title: "Black Slip Dress",
    description: "Bias silk. One piece, whole evening.",
    imageUrl: "/closet/dress-slip.jpg",
    category: "dress",
    color: "black",
    colorHex: "#1A1614",
    brand: "Casa Linen",
    season: "all",
    size: "M",
  },
  {
    title: "Black Blazer",
    description: "Peak lapel. Puts a look together.",
    imageUrl: "/closet/blazer-black.jpg",
    category: "outerwear",
    color: "black",
    colorHex: "#1A1614",
    brand: "Tailor Row",
    season: "all",
    size: "M",
  },
  {
    title: "Court Sneaker",
    description: "White leather. Quiet on purpose.",
    imageUrl: "/closet/sneakers-white.jpg",
    category: "shoes",
    color: "white",
    colorHex: "#F7F4EE",
    brand: "Cairo Last",
    season: "all",
    size: "38",
  },
];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function colorMeta(id: string) {
  return COLORS.find((c) => c.id === id);
}
