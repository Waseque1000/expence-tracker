"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Bell, BellRing, Check, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { daysUntil, formatDate, todayISO } from "@/lib/format";
import type { Bill, BillFrequency } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.coerce.number().positive("Enter a valid amount"),
  dueDate: z.string().min(1, "Due date is required"),
  frequency: z.enum(["Once", "Monthly", "Quarterly", "Yearly"] as const),
  provider: z.string().optional(),
});

type Values = z.infer<typeof schema>;

function dueBadge(days: number) {
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, variant: "danger" as const };
  if (days === 0) return { label: "Due today", variant: "danger" as const };
  if (days === 1) return { label: "Due tomorrow", variant: "warning" as const };
  if (days <= 3) return { label: `${days} days left`, variant: "warning" as const };
  return { label: formatDate(new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)), variant: "secondary" as const };
}

export default function BillsPage() {
  const { bills, addBill, toggleBillPaid, deleteBill } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: { title: "", amount: undefined, dueDate: todayISO(), frequency: "Monthly", provider: "" },
  });

  const sorted = useMemo(
    () => [...bills].sort((a, b) => Number(a.paid) - Number(b.paid) || a.dueDate.localeCompare(b.dueDate)),
    [bills]
  );
  const unpaid = bills.filter((b) => !b.paid);
  const paid = bills.filter((b) => b.paid);
  const dueSoon = unpaid.filter((b) => {
    const d = daysUntil(b.dueDate);
    return d >= 0 && d <= 3;
  }).length;
  const monthlyTotal = unpaid
    .filter((b) => b.frequency === "Monthly")
    .reduce((s, b) => s + b.amount, 0);

  const onSubmit = (v: Values) => {
    addBill({ ...v, paid: false, provider: v.provider || undefined });
    toast({ title: "Bill added", description: `${v.title} · ৳${v.amount.toLocaleString()}`, type: "success" });
    setOpen(false);
    reset({ title: "", amount: undefined, dueDate: todayISO(), frequency: "Monthly", provider: "" });
  };

  const frequency = watch("frequency");

  const renderBill = (b: Bill) => {
    const days = daysUntil(b.dueDate);
    const badge = dueBadge(days);
    return (
      <div
        key={b.id}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
          b.paid ? "border-[var(--border)] opacity-60" : "border-[var(--border)] hover:bg-[var(--muted)]"
        )}
      >
        <button
          onClick={() => {
            toggleBillPaid(b.id);
            toast({
              title: b.paid ? "Bill marked unpaid" : "Bill paid!",
              description: b.paid ? b.title : `${b.title} · ৳${b.amount.toLocaleString()}`,
              type: "success",
            });
          }}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer",
            b.paid
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-[var(--border)] hover:border-emerald-500"
          )}
          aria-label={b.paid ? "Mark unpaid" : "Mark paid"}
        >
          {b.paid && <Check className="h-3.5 w-3.5" />}
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <BellRing className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {b.title}
            {b.provider && <span className="ml-1.5 text-xs text-[var(--muted-foreground)]">· {b.provider}</span>}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Due {formatDate(b.dueDate)} · {b.frequency}
          </p>
        </div>
        <Badge variant={badge.variant} className="shrink-0 px-2 text-[10px] sm:px-2.5 sm:text-xs">
          {badge.label}
        </Badge>
        <div className="shrink-0 text-right">
          <p className={cn("text-sm font-semibold tabular-nums whitespace-nowrap", b.paid && "line-through text-[var(--muted-foreground)]")}>
            ৳{b.amount.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => {
            deleteBill(b.id);
            toast({ title: "Bill deleted", description: b.title, type: "info" });
          }}
          className="rounded-lg p-2 text-[var(--muted-foreground)] transition-all hover:bg-rose-500/10 hover:text-rose-500 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 cursor-pointer"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills & reminders</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {unpaid.length} unpaid · {dueSoon} due within 3 days · ৳{monthlyTotal.toLocaleString()}/mo recurring
          </p>
        </div>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add bill
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-sky-500/20 bg-sky-500/5 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-sky-500" /> Reminder schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {["3 days before — heads-up email", "1 day before — final reminder", "Due today — urgent alert"].map((r) => (
              <div key={r} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/12 text-sky-500">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-[var(--muted-foreground)]">{r}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="space-y-2.5">
            {unpaid.length === 0 ? (
              <EmptyState
                icon={<BellRing className="h-5 w-5" />}
                title="No pending bills"
                description="Add bills and we'll remind you before they're due."
              />
            ) : (
              unpaid.map((b, i) => (
                <motion.div
                  key={b.id}
                  className="group"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {renderBill(b)}
                </motion.div>
              ))
            )}
          </div>

          {paid.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)]">
                <RefreshCw className="h-4 w-4" /> Recurring & paid
              </div>
              <div className="space-y-2.5">
                {paid.map((b, i) => (
                  <motion.div
                    key={b.id}
                    className="group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {renderBill(b)}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a bill"
        description="We'll send reminders before it's due."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="bill-form" variant="gradient">
              Add bill
            </Button>
          </>
        }
      >
        <form id="bill-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bill title">
              <Input {...register("title")} placeholder="e.g. Internet bill" />
              {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
            </Field>
            <Field label="Provider (optional)">
              <Input {...register("provider")} placeholder="e.g. Link3" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Amount">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                  ৳
                </span>
                <Input {...register("amount")} type="number" step="0.01" min="0" placeholder="0" className="pl-8" />
              </div>
              {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
            </Field>
            <Field label="Due date">
              <Input {...register("dueDate")} type="date" />
            </Field>
            <Field label="Frequency">
              <Select value={frequency} onValueChange={(v) => setValue("frequency", v as BillFrequency)}>
                {["Once", "Monthly", "Quarterly", "Yearly"].map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
