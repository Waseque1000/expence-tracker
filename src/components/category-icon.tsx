import {
  Car,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  Plane,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";

const ICONS: Record<Category, LucideIcon> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Medical: HeartPulse,
  Entertainment: Clapperboard,
  Travel: Plane,
  Education: GraduationCap,
  Investment: TrendingUp,
  Others: MoreHorizontal,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category] ?? MoreHorizontal;
  return <Icon className={className} />;
}

export { ICONS };
