"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)] card-shadow-hover max-h-[90vh] overflow-auto",
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                {description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
