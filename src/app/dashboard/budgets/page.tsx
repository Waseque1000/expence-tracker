"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertTriangle, PiggyBank, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, CATEGORY_COLORS, type Category, type Budget } from "@/types";
import { currentMonthLabel, monthKey } from "@/lib/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  limit: z.coerce.number().positive("Enter a valid limit"),
});

type Values = z.infer<typeof schema>;

export default function BudgetsPage() {
  const { budgets, expenses, addBudget, deleteBudget } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: { category: "Food", limit: undefined },
  });

  const thisMonth = monthKey(new Date());
  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === thisMonth),
    [budgets, thisMonth]
  );

  const spentByCat = (cat: string) =>
    expenses.filter((e) => e.category === cat && monthKey(e.date) === thisMonth).reduce((s, e) => s + e.amount, 0);

  const totalLimit = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + spentByCat(b.category), 0);
  const overCount = monthBudgets.filter((b) => spentByCat(b.category) > b.limit).length;

  const openAdd = () => {
    setEditing(null);
    reset({ category: "Food", limit: undefined });
    setOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    reset({ category: b.category, limit: b.limit });
    setOpen(true);
  };

  const onSubmit = (v: Values) => {
    addBudget({ category: v.category, limit: v.limit, month: thisMonth });
    toast({
      title: editing ? "Budget updated" : "Budget created",
      description: `${v.category} · ৳${v.limit.toLocaleString()}/month`,
      type: "success",
    });
    setOpen(false);
  };

  const category = watch("category");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {currentMonthLabel()} · {monthBudgets.length} budgets · {overCount} over budget
          </p>
        </div>
        <Button variant="gradient" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add budget
        </Button>
      </div>

      {overCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Budget alert: {overCount} {overCount === 1 ? "category is" : "categories are"} over budget
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {monthBudgets
                .filter((b) => spentByCat(b.category) > b.limit)
                .map((b) => b.category)
                .join(", ")}{" "}
              — an email reminder has been sent.
            </p>
          </div>
        </motion.div>
      )}

      {totalLimit > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Overall budget usage</p>
              <p className="text-xs text-[var(--muted-foreground)]">Across all categories this month</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums">
                {((totalSpent / totalLimit) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                ৳{totalSpent.toLocaleString()} / ৳{totalLimit.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress
            value={(totalSpent / totalLimit) * 100}
            className="h-3"
            indicatorClassName={
              totalSpent > totalLimit ? "from-rose-500 to-rose-500" : undefined
            }
          />
        </Card>
      )}

      {monthBudgets.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="h-5 w-5" />}
          title="No budgets for this month"
          description="Set a monthly limit per category to keep spending in check."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Create budget
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {monthBudgets.map((b, i) => {
            const spent = spentByCat(b.category);
            const pct = (spent / b.limit) * 100;
            const over = spent > b.limit;
            const remaining = b.limit - spent;
            const color = CATEGORY_COLORS[b.category];
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Card
                  className={cn(
                    "group h-full transition-all hover:-translate-y-0.5 hover:card-shadow-hover",
                    over && "border-rose-500/40"
                  )}
                >
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}1f`, color }}
                      >
                        <span className="text-sm font-bold">{b.category.slice(0, 2).toUpperCase()}</span>
                      </span>
                      <CardTitle className="text-sm">{b.category}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(b)}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                        title="Edit budget"
                      >
                        <PiggyBank className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          deleteBudget(b.id);
                          toast({ title: "Budget deleted", description: b.category, type: "info" });
                        }}
                        className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        title="Delete budget"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                      <p className="text-xl font-bold tracking-tight sm:text-2xl">
                        ৳{spent.toLocaleString()}
                        <span className="text-sm font-normal text-[var(--muted-foreground)]">
                          {" "}
                          / ৳{b.limit.toLocaleString()}
                        </span>
                      </p>
                      <Badge variant={over ? "danger" : pct >= 75 ? "warning" : "success"}>
                        {over ? "Over budget" : `${(100 - Math.min(100, pct)).toFixed(0)}% left`}
                      </Badge>
                    </div>
                    <Progress
                      value={pct}
                      indicatorClassName={over ? "from-rose-500 to-rose-600" : undefined}
                    />
                    <p className={cn("mt-2 text-xs", over ? "text-rose-500" : "text-[var(--muted-foreground)]")}>
                      {over
                        ? `৳${Math.abs(remaining).toLocaleString()} over budget`
                        : `৳${remaining.toLocaleString()} remaining`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit budget" : "Add budget"}
        description={`Monthly limit for ${currentMonthLabel()}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="budget-form" variant="gradient">
              {editing ? "Save changes" : "Create budget"}
            </Button>
          </>
        }
      >
        <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Category">
            <Select value={category} onValueChange={(v) => setValue("category", v as Category)}>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>
          </Field>
          <Field label="Monthly limit">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                ৳
              </span>
              <Input {...register("limit")} type="number" step="100" min="0" placeholder="0" className="pl-8" />
            </div>
            {errors.limit && <p className="text-xs text-rose-500">{errors.limit.message}</p>}
          </Field>
        </form>
      </Modal>
    </div>
  );
}
