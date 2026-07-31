"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]",
        className
      )}
    >
      <motion.div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]",
          indicatorClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
