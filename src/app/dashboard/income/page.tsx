"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { PiggyBank, Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { INCOME_SOURCES, type Income, type IncomeSource } from "@/types";
import { formatDate, todayISO, monthKey } from "@/lib/format";

const schema = z.object({
  source: z.enum(INCOME_SOURCES as [IncomeSource, ...IncomeSource[]]),
  amount: z.coerce.number().positive("Enter a valid amount"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function IncomePage() {
  const { income, addIncome, deleteIncome, settings } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: { source: "Salary", amount: undefined, date: todayISO(), notes: "" },
  });

  const thisMonth = income
    .filter((i) => monthKey(i.date) === monthKey(new Date()))
    .reduce((s, i) => s + i.amount, 0);
  const lastMonth = income
    .filter((i) => monthKey(i.date) === monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)))
    .reduce((s, i) => s + i.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const { expenses } = useStore();
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    income.forEach((i) => map.set(i.source, (map.get(i.source) ?? 0) + i.amount));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [income]);

  const sorted = useMemo(() => [...income].sort((a, b) => b.date.localeCompare(a.date)), [income]);

  const openAdd = () => {
    setEditing(null);
    reset({ source: "Salary", amount: undefined, date: todayISO(), notes: "" });
    setOpen(true);
  };

  const openEdit = (i: Income) => {
    setEditing(i);
    reset({ source: i.source, amount: i.amount, date: i.date, notes: i.notes ?? "" });
    setOpen(true);
  };

  const onSubmit = (v: Values) => {
    if (editing) {
      addIncome(v);
      deleteIncome(editing.id);
      toast({ title: "Income updated", type: "success" });
    } else {
      addIncome(v);
      toast({ title: "Income added", description: `${v.source} · ৳${v.amount.toLocaleString()}`, type: "success" });
    }
    setOpen(false);
  };

  const source = watch("source");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Track every source of earnings</p>
        </div>
        <Button variant="gradient" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add income
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"
        >
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
            This month
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">৳{thisMonth.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {lastMonth > 0 && `+${(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}% vs last month`}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow"
        >
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <TrendingUp className="h-4 w-4 text-sky-500" />
            Total income
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight">৳{totalIncome.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">All time</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow"
        >
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <PiggyBank className="h-4 w-4 text-violet-500" />
            Net balance
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-500">
            ৳{(totalIncome - totalExpenses).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Income − expenses</p>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold">Income by source</h3>
          <div className="mt-4 space-y-3">
            {bySource.map(([src, amt]) => {
              const pct = totalIncome ? (amt / totalIncome) * 100 : 0;
              return (
                <div key={src}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{src}</span>
                    <span className="text-[var(--muted-foreground)]">
                      ৳{amt.toLocaleString()} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-2">
          {sorted.length === 0 ? (
            <EmptyState
              icon={<Wallet className="h-5 w-5" />}
              title="No income recorded"
              description="Add your salary, freelance earnings, or any other income."
              action={
                <Button size="sm" onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add income
                </Button>
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {sorted.map((i) => (
                  <div
                    key={i.id}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)] sm:px-5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-500">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{i.source}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {formatDate(i.date)}
                        {i.notes ? ` · ${i.notes}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteIncome(i.id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-all hover:bg-rose-500/10 hover:text-rose-500 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums text-emerald-500">
                      +৳{i.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit income" : "Add income"}
        description="Record money coming in."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="income-form" variant="gradient">
              {editing ? "Save changes" : "Add income"}
            </Button>
          </>
        }
      >
        <form id="income-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Source">
            <Select value={source} onValueChange={(v) => setValue("source", v as IncomeSource)}>
              {INCOME_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ৳
                </span>
                <Input {...register("amount")} type="number" step="0.01" min="0" placeholder="0.00" className="pl-8" />
              </div>
              {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
            </Field>
            <Field label="Date">
              <Input {...register("date")} type="date" />
            </Field>
          </div>
          <Field label="Notes" hint="Optional">
            <Input {...register("notes")} placeholder="e.g. March salary" />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
