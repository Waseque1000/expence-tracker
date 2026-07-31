"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuroraBackground({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--background))]" />
        <div className="animate-float-slow absolute -top-32 -left-24 h-[32rem] w-[32rem] rounded-full bg-[var(--primary)] opacity-[0.16] blur-[120px] dark:opacity-[0.22]" />
        <div className="animate-float-slower absolute top-1/4 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)] opacity-[0.14] blur-[120px] dark:opacity-[0.18]" />
        <div className="animate-float-slow absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#f43f5e] opacity-[0.08] blur-[130px] dark:opacity-[0.12]" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] bg-[radial-gradient(circle_at_center,var(--muted-foreground)_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
      </div>
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
