"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultValue,
  onValueChange,
  children,
  className,
}: {
  tabs: { value: string; label: string; icon?: React.ReactNode }[];
  defaultValue: string;
  onValueChange?: (v: string) => void;
  children?: (active: string) => React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className}>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-[var(--muted)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActive(tab.value);
              onValueChange?.(tab.value);
            }}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              active === tab.value
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {active === tab.value && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-[var(--card)] card-shadow"
                transition={{ type: "spring", damping: 28, stiffness: 400 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      {children?.(active)}
    </div>
  );
}
