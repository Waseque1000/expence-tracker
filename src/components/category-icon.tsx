import {
  Car,
  Clapperboard,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Utensils,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";

const ICONS: Record<Category, LucideIcon> = {
  "House Rent": Home,
  "Fixed Bazar": ShoppingBag,
  "Utilities Bill": Zap,
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingCart,
  Bills: Receipt,
  Medical: HeartPulse,
  Education: GraduationCap,
  Entertainment: Clapperboard,
  "Family & Care": Sparkles,
  "EMI & Loans": CreditCard,
  Investment: TrendingUp,
  Travel: Plane,
  "Charity & Gifts": Gift,
  Maintenance: Wrench,
  Others: MoreHorizontal,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category] ?? MoreHorizontal;
  return <Icon className={className} />;
}

export { ICONS };
