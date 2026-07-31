"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  { icon: AlertTriangle, type: "warning" as const, title: "Food budget at 92%", time: "2h ago" },
  { icon: CheckCircle2, type: "success" as const, title: "Internet bill paid", time: "5h ago" },
  { icon: TrendingUp, type: "info" as const, title: "Monthly report ready", time: "1d ago" },
];

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggle } = useTheme();
  const { settings, bills } = useStore();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dueBills = bills.filter((b) => !b.paid).length;
  const totalNotifs = NOTIFICATIONS.length + Math.min(dueBills, 3);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.displayName || settings.name;
  const displayEmail = user?.email || settings.email;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] lg:hidden cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          placeholder="Search expenses, categories..."
          className="h-10 w-full rounded-xl border border-[var(--input)] bg-[var(--muted)]/50 pl-10 pr-4 text-sm transition-colors placeholder:text-[var(--muted-foreground)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {totalNotifs > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {totalNotifs}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow-hover"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {NOTIFICATIONS.length} new
                    </span>
                  </div>
                  <div className="max-h-80 overflow-auto p-2">
                    {[
                      ...NOTIFICATIONS.map((n) => ({ ...n, isBill: false })),
                      ...bills
                        .filter((b) => !b.paid)
                        .slice(0, 3)
                        .map((b) => ({
                          icon: AlertTriangle,
                          type: "warning" as const,
                          title: `${b.title} due soon`,
                          time: `৳${b.amount.toLocaleString()}`,
                          isBill: true,
                        })),
                    ].map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--muted)]"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            n.type === "warning" && "bg-amber-500/12 text-amber-500",
                            n.type === "success" && "bg-emerald-500/12 text-emerald-500",
                            n.type === "info" && "bg-sky-500/12 text-sky-500"
                          )}
                        >
                          <n.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-1 flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-[var(--muted)]">
          <Avatar name={displayName} src={user?.photoURL ?? undefined} />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <p className="text-xs leading-tight text-[var(--muted-foreground)]">{displayEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer disabled:opacity-60"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
