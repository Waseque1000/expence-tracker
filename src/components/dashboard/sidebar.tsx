"use client";

import {
  BarChart3,
  BellRing,
  FileText,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { label: "Income", href: "/dashboard/income", icon: Wallet },
  { label: "Budgets", href: "/dashboard/budgets", icon: PiggyBank },
  { label: "Bills", href: "/dashboard/bills", icon: BellRing },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Goals", href: "/dashboard/goals", icon: Target },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
];

export const BOTTOM_ITEMS = [{ label: "Settings", href: "/dashboard/settings", icon: Settings }];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const renderLinks = (items: typeof NAV_ITEMS) =>
    items.map((item) => {
      const active = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          {active && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-xl bg-[var(--muted)]"
              transition={{ type: "spring", damping: 30, stiffness: 380 }}
            />
          )}
          <item.icon
            className={cn(
              "relative z-10 h-4.5 w-4.5 transition-colors",
              active && "text-[var(--primary)]"
            )}
          />
          <span className="relative z-10">{item.label}</span>
          {active && (
            <motion.span
              layoutId="sidebar-dot"
              className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
            />
          )}
        </Link>
      );
    });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--background)] transition-transform duration-300 lg:translate-x-0 lg:bg-transparent",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-5">
          <Link href="/" onClick={onClose}>
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
          <nav className="space-y-1">{renderLinks(NAV_ITEMS)}</nav>
          <nav className="space-y-1 border-t border-[var(--border)] pt-3">
            {renderLinks(BOTTOM_ITEMS)}
          </nav>
        </div>
        <div className="p-3">
          <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/8 p-4">
            <p className="text-sm font-semibold">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Unlock AI insights, receipt scanning & unlimited expenses.
            </p>
            <Link
              href="#"
              onClick={onClose}
              className="mt-3 inline-block rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--accent))] px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Upgrade now
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
