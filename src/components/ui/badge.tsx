import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--primary)] text-white",
        secondary: "border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]",
        success: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        danger: "border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400",
        warning: "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400",
        info: "border-transparent bg-sky-500/15 text-sky-600 dark:text-sky-400",
        outline: "border-[var(--border)] text-[var(--muted-foreground)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
