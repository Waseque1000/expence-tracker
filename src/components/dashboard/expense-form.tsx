"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { CATEGORIES, PAYMENT_METHODS, type Expense, type Category, type PaymentMethod } from "@/types";
import { todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.coerce.number().positive("Enter a valid amount"),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(PAYMENT_METHODS as [PaymentMethod, ...PaymentMethod[]]),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function ExpenseForm({
  open,
  onClose,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  expense?: Expense | null;
}) {
  const { addExpense, updateExpense } = useStore();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: "",
      amount: undefined,
      category: "Food",
      date: todayISO(),
      paymentMethod: "Cash",
      notes: "",
    },
  });

  const category = watch("category");
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (open) {
      reset({
        title: expense?.title ?? "",
        amount: expense?.amount ?? undefined,
        category: expense?.category ?? "Food",
        date: expense?.date ?? todayISO(),
        paymentMethod: expense?.paymentMethod ?? "Cash",
        notes: expense?.notes ?? "",
      });
      setTags(expense?.tags ?? []);
      setReceipt(expense?.receipt ?? null);
    }
  }, [open, expense, reset]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const onSubmit = (v: Values) => {
    const payload = { ...v, tags, receipt: receipt ?? undefined };
    if (expense) {
      updateExpense(expense.id, payload);
      toast({ title: "Expense updated", type: "success" });
    } else {
      addExpense(payload);
      toast({ title: "Expense added", description: `${v.title} · ৳${v.amount.toLocaleString()}`, type: "success" });
    }
    onClose();
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setReceipt("mock://receipt.png");
      setValue("title", "Kacchi Bhai Restaurant");
      setValue("amount", 850);
      setValue("category", "Food");
      setValue("date", todayISO());
      setTags(["dining", "lunch"]);
      toast({ title: "Receipt scanned", description: "Detected store, amount & items automatically", type: "info" });
    }, 1600);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? "Edit expense" : "Add expense"}
      description="Record a transaction in a few seconds."
      className="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" variant="gradient">
            {expense ? "Save changes" : "Add expense"}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input {...register("title")} placeholder="e.g. Lunch at Kacchi Bhai" />
            {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}
          </Field>
          <Field label="Amount">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                ৳
              </span>
              <Input {...register("amount")} type="number" step="0.01" min="0" placeholder="0.00" className="pl-8" />
            </div>
            {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
          </Field>
          <Field label="Category">
            <Select
              value={category}
              onValueChange={(v) => setValue("category", v as Category)}
            >
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input {...register("date")} type="date" />
          </Field>
        </div>

        <Field label="Payment method">
          <Select
            value={paymentMethod}
            onValueChange={(v) => setValue("paymentMethod", v as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </Select>
        </Field>

        <Field label="Notes" hint="Optional — anything you want to remember">
          <Textarea {...register("notes")} placeholder="Add a note..." rows={2} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tags">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--input)] px-2 py-1.5 focus-within:ring-2 focus-within:ring-[var(--ring)]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]"
                >
                  #{t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-rose-500 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder={tags.length ? "" : "Add tag +"}
                className="min-w-[80px] flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
              />
            </div>
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Receipt</span>
            <button
              type="button"
              onClick={simulateScan}
              disabled={scanning}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--input)] text-sm text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] cursor-pointer disabled:opacity-50",
                receipt && "border-solid border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning with AI...
                </>
              ) : receipt ? (
                <>
                  <ImagePlus className="h-4 w-4" /> Receipt attached
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" /> Scan receipt (AI)
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
