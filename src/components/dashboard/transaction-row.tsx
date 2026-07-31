"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_COLORS, type Expense } from "@/types";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export function TransactionRow({
  expense,
  index = 0,
  onEdit,
}: {
  expense: Expense;
  index?: number;
  onEdit?: (e: Expense) => void;
}) {
  const { settings } = useStore();
  const color = CATEGORY_COLORS[expense.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.35 }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--muted)]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <CategoryIcon category={expense.category} className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.title}</p>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <span>{formatDate(expense.date)}</span>
          <span>·</span>
          <span>{expense.paymentMethod}</span>
        </div>
      </div>
      {onEdit && (
        <div className="hidden items-center gap-1 sm:flex">
          {expense.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px]">
              #{t}
            </Badge>
          ))}
        </div>
      )}
      <span className="text-sm font-semibold tabular-nums">
        -{new Intl.NumberFormat("en-US").format(expense.amount)}{" "}
        <span className="text-xs font-normal text-[var(--muted-foreground)]">
          {settings.currency === "BDT" ? "৳" : settings.currency}
        </span>
      </span>
      {onEdit && (
        <button
          onClick={() => onEdit(expense)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--primary)] transition-opacity hover:bg-[var(--primary)]/10 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        >
          Edit
        </button>
      )}
    </motion.div>
  );
}
