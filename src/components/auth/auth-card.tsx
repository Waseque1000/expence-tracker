"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[26rem]"
    >
      <div className="mb-6 flex justify-center lg:hidden">
        <Logo />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 p-6 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.12] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[var(--accent)] opacity-[0.1] blur-3xl" />

        <div className="relative mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] shadow-[0_8px_24px_-6px_var(--primary)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
              <path
                d="M3 17l4-6 4 4 5-8 5 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="19" cy="7" r="1.6" fill="currentColor" />
            </svg>
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        </div>

        <div className="relative">{children}</div>
      </div>
    </motion.div>
  );
}
