"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  delay = 0,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
  delay?: number;
  className?: string;
}) {
  const positive = (trend ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow transition-shadow hover:card-shadow-hover",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--primary)]/8 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--primary)]">
          <Icon className="h-4.5 w-4.5" />
        </span>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              positive
                ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/12 text-rose-600 dark:text-rose-400"
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-[13px] font-medium text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{sub}</p>}
    </motion.div>
  );
}
