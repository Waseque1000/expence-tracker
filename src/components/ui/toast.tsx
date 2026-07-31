"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; type?: "success" | "info" | "warning" | "error" };

const ToastContext = createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    info: <Info className="h-5 w-5 text-sky-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertTriangle className="h-5 w-5 text-rose-500" />,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow-hover"
              )}
            >
              {icons[t.type ?? "info"]}
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{t.description}</p>}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
