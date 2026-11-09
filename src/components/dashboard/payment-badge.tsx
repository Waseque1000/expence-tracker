"use client";

import React from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  Smartphone,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<PaymentMethod, LucideIcon> = {
  Cash: Banknote,
  Bank: Building2,
  "Credit Card": CreditCard,
  "Debit Card": CreditCard,
  bKash: Smartphone,
  Nagad: Smartphone,
  Rocket: Smartphone,
  PayPal: Globe,
};

const STYLES: Record<
  PaymentMethod,
  { bg: string; text: string; border: string; dot: string }
> = {
  Cash: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200/90 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  "Credit Card": {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200/90 dark:border-purple-800/60",
    dot: "bg-purple-500",
  },
  "Debit Card": {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/90 dark:border-blue-800/60",
    dot: "bg-blue-500",
  },
  Bank: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200/90 dark:border-indigo-800/60",
    dot: "bg-indigo-600",
  },
  bKash: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-[#e2136e] dark:text-pink-400 font-bold",
    border: "border-pink-200/90 dark:border-pink-800/60",
    dot: "bg-[#e2136e]",
  },
  Nagad: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-[#ea580c] dark:text-orange-400 font-bold",
    border: "border-orange-200/90 dark:border-orange-800/60",
    dot: "bg-[#ea580c]",
  },
  Rocket: {
    bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    text: "text-[#8c3494] dark:text-fuchsia-400 font-bold",
    border: "border-fuchsia-200/90 dark:border-fuchsia-800/60",
    dot: "bg-[#8c3494]",
  },
  PayPal: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-[#0284c7] dark:text-sky-300 font-bold",
    border: "border-sky-200/90 dark:border-sky-800/60",
    dot: "bg-[#0284c7]",
  },
};

export function PaymentBadge({
  method,
  className,
  showIcon = true,
}: {
  method: PaymentMethod;
  className?: string;
  showIcon?: boolean;
}) {
  const style = STYLES[method] ?? {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  };
  const Icon = ICONS[method] ?? CreditCard;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-2xs transition-colors",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{method}</span>
    </span>
  );
}

