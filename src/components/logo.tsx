import { cn } from "@/lib/utils";

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] shadow-[0_4px_16px_-4px_var(--primary)]">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white" fill="none">
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
      {!iconOnly && (
        <span className="text-lg font-bold tracking-tight">
          ExpenseFlow<span className="text-gradient"> AI</span>
        </span>
      )}
    </span>
  );
}
