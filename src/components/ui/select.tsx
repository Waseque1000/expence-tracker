"use client";

import React, { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onSelect: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

export function Select({
  value,
  onValueChange,
  children,
  className,
  placeholder,
  disabled,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onSelect: onValueChange, open, setOpen }}>
      <div ref={ref} className={cn("relative", className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-[var(--input)] bg-transparent px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            open && "ring-2 ring-[var(--ring)]"
          )}
        >
          <span className={cn("truncate", !value && "text-[var(--muted-foreground)]")}>
            {value || placeholder || "Select..."}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div
            className="absolute z-50 mt-1 max-h-64 w-full min-w-[9rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] card-shadow-hover p-1"
            id={id}
          >
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(SelectContext)!;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => {
        ctx.onSelect(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--muted)] cursor-pointer",
        active && "text-[var(--primary)] font-medium"
      )}
    >
      <span>{children}</span>
      {active && <Check className="h-4 w-4" />}
    </button>
  );
}
