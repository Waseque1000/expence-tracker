import type { UserSettings } from "@/types";

export const CURRENCY_SYMBOLS: Record<UserSettings["currency"], string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  INR: "₹",
};

export function formatMoney(
  amount: number,
  currency: UserSettings["currency"] = "BDT"
) {
  const symbol = CURRENCY_SYMBOLS[currency];
  const value = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${symbol}${value}`;
}

export function formatCompact(amount: number, currency: UserSettings["currency"] = "BDT") {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${symbol}${Math.round(amount)}`;
}

export function todayISO() {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthKey(date: string | Date) {
  return toISODate(typeof date === "string" ? new Date(date + "T00:00:00") : date).slice(0, 7);
}

export function formatDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  });
}

export function daysUntil(date: string) {
  const target = new Date(date + "T00:00:00").getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / 86_400_000);
}

export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  return days;
}

export function currentMonthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
