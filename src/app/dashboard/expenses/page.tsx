"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { CategoryIcon } from "@/components/category-icon";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, CATEGORY_COLORS, PAYMENT_METHODS, type Expense } from "@/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ExpensesPage() {
  const { expenses, deleteExpense, duplicateExpense, settings } = useStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");
  const [month, setMonth] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    let list = [...expenses];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category !== "all") list = list.filter((e) => e.category === category);
    if (method !== "all") list = list.filter((e) => e.paymentMethod === method);
    if (month !== "all") list = list.filter((e) => e.date.startsWith(month));
    list.sort((a, b) =>
      sortBy === "oldest"
        ? a.date.localeCompare(b.date)
        : sortBy === "amount"
          ? b.amount - a.amount
          : b.date.localeCompare(a.date)
    );
    return list;
  }, [expenses, query, category, method, month, sortBy]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleEdit = (e: Expense) => {
    setEditing(e);
    setFormOpen(true);
  };

  const handleDelete = (e: Expense) => {
    deleteExpense(e.id);
    toast({ title: "Expense deleted", description: e.title, type: "info" });
  };

  const handleDuplicate = (e: Expense) => {
    duplicateExpense(e.id);
    toast({ title: "Expense duplicated", type: "success" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {filtered.length} transactions · ৳{total.toLocaleString()} total
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, notes, tags..."
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </Select>
          <Select value={method} onValueChange={setMethod}>
            <SelectItem value="all">All payment methods</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectItem value="all">All months</SelectItem>
            {months.map((m) => {
              const [y, mo] = m.split("-");
              const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
              return (
                <SelectItem key={m} value={m}>
                  {label}
                </SelectItem>
              );
            })}
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="amount">Highest amount</SelectItem>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="No expenses found"
          description="Try adjusting your filters or add a new expense."
          action={
            <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" /> Add expense
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((e) => {
              const color = CATEGORY_COLORS[e.category];
              return (
                <div
                  key={e.id}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)] sm:px-5"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}1f`, color }}
                  >
                    <CategoryIcon category={e.category} className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      {e.receipt && <Receipt className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted-foreground)]">
                      <span>{formatDate(e.date)}</span>
                      <span>·</span>
                      <span>{e.paymentMethod}</span>
                      {e.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="px-1.5 py-0 text-[10px]">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    <button
                      onClick={() => handleEdit(e)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(e)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-all hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(e)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-all hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums",
                      e.amount >= 5000 && "text-rose-500"
                    )}
                  >
                    -৳{e.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} expense={editing} />
    </div>
  );
}
