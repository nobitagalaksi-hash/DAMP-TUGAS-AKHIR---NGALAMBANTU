import {
  Truck,
  Package,
  ShoppingBag,
  Wrench,
  Printer,
  HeartPulse,
  BookOpen,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

export type CategoryKey =
  | "kurir_antar"
  | "pindahan_angkat"
  | "titip_beli"
  | "reparasi_servis"
  | "print_admin"
  | "kesehatan_darurat"
  | "les_belajar"
  | "hewan_peliharaan";

export interface CategoryMeta {
  key: CategoryKey;
  slug: string;
  label: string;
  emoji: string;
  Icon: LucideIcon;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "kurir_antar", slug: "kurir-antar", label: "Kurir & Antar", emoji: "🚗", Icon: Truck },
  {
    key: "pindahan_angkat",
    slug: "pindahan-angkat",
    label: "Pindahan & Angkat",
    emoji: "📦",
    Icon: Package,
  },
  { key: "titip_beli", slug: "titip-beli", label: "Titip Beli", emoji: "🛍️", Icon: ShoppingBag },
  {
    key: "reparasi_servis",
    slug: "reparasi-servis",
    label: "Reparasi & Servis",
    emoji: "🔧",
    Icon: Wrench,
  },
  { key: "print_admin", slug: "print-admin", label: "Print & Admin", emoji: "🖨️", Icon: Printer },
  {
    key: "kesehatan_darurat",
    slug: "kesehatan-darurat",
    label: "Kesehatan & Darurat",
    emoji: "🏥",
    Icon: HeartPulse,
  },
  { key: "les_belajar", slug: "les-belajar", label: "Les & Belajar", emoji: "📚", Icon: BookOpen },
  {
    key: "hewan_peliharaan",
    slug: "hewan-peliharaan",
    label: "Hewan Peliharaan",
    emoji: "🐾",
    Icon: PawPrint,
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, CategoryMeta>;

export const CATEGORY_BY_SLUG: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export const KECAMATAN_LIST = [
  "Lowokwaru",
  "Klojen",
  "Blimbing",
  "Sukun",
  "Kedungkandang",
] as const;
export type Kecamatan = (typeof KECAMATAN_LIST)[number];
