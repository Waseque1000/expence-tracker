import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-[0_1px_2px_rgb(0_0_0/0.1),0_8px_20px_-8px_var(--primary)] hover:brightness-110",
        secondary:
          "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color-mix(in_oklab,var(--muted)_80%,var(--foreground)_10%)]",
        outline:
          "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)]",
        ghost: "hover:bg-[var(--muted)]",
        danger:
          "bg-rose-600 text-white hover:bg-rose-500 shadow-[0_8px_20px_-8px_#e11d48]",
        gradient:
          "bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white shadow-[0_8px_24px_-8px_var(--primary)] hover:brightness-110",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
