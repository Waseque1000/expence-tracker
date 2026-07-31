"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { categoryBreakdown } from "@/lib/analytics";
import { formatDate } from "@/lib/format";
import { CATEGORY_COLORS, type Expense } from "@/types";
import { useToast } from "@/components/ui/toast";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export default function ReportsPage() {
  const { expenses, income, settings } = useStore();
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("monthly");
  const [customFrom, setCustomFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().slice(0, 10));

  const range = useMemo((): { from: string; to: string } => {
    const now = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    switch (period) {
      case "daily":
        return { from: iso(now), to: iso(now) };
      case "weekly": {
        const from = new Date(now);
        from.setDate(from.getDate() - from.getDay());
        return { from: iso(from), to: iso(now) };
      }
      case "monthly": {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: iso(from), to: iso(now) };
      }
      case "yearly":
        return { from: iso(new Date(now.getFullYear(), 0, 1)), to: iso(now) };
      case "custom":
        return { from: customFrom, to: customTo };
    }
  }, [period, customFrom, customTo]);

  const filteredExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date >= range.from && e.date <= range.to)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, range]
  );
  const filteredIncome = useMemo(
    () => income.filter((i) => i.date >= range.from && i.date <= range.to),
    [income, range]
  );

  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = filteredIncome.reduce((s, i) => s + i.amount, 0);
  const cats = useMemo(() => categoryBreakdown(filteredExpenses), [filteredExpenses]);
  const biggest = filteredExpenses.reduce((m, e) => (e.amount > m.amount ? e : m), {
    title: "—",
    amount: 0,
  } as Pick<Expense, "title" | "amount">);

  const periodLabel =
    period === "custom"
      ? `${formatDate(customFrom)} – ${formatDate(customTo)}`
      : `${period.charAt(0).toUpperCase() + period.slice(1)} report`;

  const csv = useMemo(() => {
    const rows = [
      ["Title", "Amount", "Category", "Payment Method", "Date", "Tags"],
      ...filteredExpenses.map((e) => [
        `"${e.title}"`,
        e.amount,
        e.category,
        e.paymentMethod,
        e.date,
        `"${e.tags.join(", ")}"`,
      ]),
    ];
    return rows.map((r) => r.join(",")).join("\n");
  }, [filteredExpenses]);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsv = () => {
    downloadFile(csv, `expenseflow-${period}-report.csv`, "text/csv;charset=utf-8");
    toast({ title: "CSV exported", description: `${filteredExpenses.length} transactions`, type: "success" });
  };

  const handleExcel = () => {
    downloadFile("\ufeff" + csv, `expenseflow-${period}-report.xls`, "application/vnd.ms-excel");
    toast({ title: "Excel exported", description: `${filteredExpenses.length} transactions`, type: "success" });
  };

  const handlePdf = () => {
    window.print();
    toast({ title: "PDF report opened", description: "Use your browser's Save as PDF", type: "info" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Generate and export financial reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCsv}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExcel}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePdf}>
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Report period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            defaultValue="monthly"
            tabs={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
              { value: "custom", label: "Custom" },
            ]}
            onValueChange={(v) => setPeriod(v as Period)}
          />
          {period === "custom" && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">From</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 rounded-xl border border-[var(--input)] bg-transparent px-3 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium">To</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 rounded-xl border border-[var(--input)] bg-transparent px-3 text-sm"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div id="report" className="space-y-4">
        <motion.div
          key={period + range.from}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
                ExpenseFlow AI · {periodLabel}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">৳{totalExpense.toLocaleString()} total expenses</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary">Generated {new Date().toLocaleDateString()}</Badge>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Income ৳{totalIncome.toLocaleString()} · Net ৳{(totalIncome - totalExpense).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--muted)] p-4">
              <p className="text-xs text-[var(--muted-foreground)]">Transactions</p>
              <p className="mt-1 text-xl font-bold">{filteredExpenses.length}</p>
            </div>
            <div className="rounded-xl bg-[var(--muted)] p-4">
              <p className="text-xs text-[var(--muted-foreground)]">Biggest expense</p>
              <p className="mt-1 truncate text-xl font-bold">৳{biggest.amount.toLocaleString()}</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">{biggest.title}</p>
            </div>
            <div className="rounded-xl bg-[var(--muted)] p-4">
              <p className="text-xs text-[var(--muted-foreground)]">Avg per transaction</p>
              <p className="mt-1 text-xl font-bold">
                ৳{filteredExpenses.length ? Math.round(totalExpense / filteredExpenses.length).toLocaleString() : "0"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>By category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cats.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No data for this period.</p>}
              {cats.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                    />
                    {c.category}
                  </span>
                  <span className="font-medium tabular-nums">
                    ৳{c.total.toLocaleString()} · {totalExpense ? ((c.total / totalExpense) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">{filteredExpenses.length} entries</p>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <EmptyState title="No transactions" description="Nothing was recorded in this period." />
              ) : (
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--card)]">
                      <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
                        <th className="pb-2 pr-3 font-medium">Title</th>
                        <th className="hidden pb-2 pr-3 font-medium sm:table-cell">Category</th>
                        <th className="pb-2 pr-3 font-medium">Date</th>
                        <th className="pb-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredExpenses.map((e) => (
                        <tr key={e.id} className="transition-colors hover:bg-[var(--muted)]">
                          <td className="max-w-[10rem] truncate py-2.5 pr-3 font-medium sm:max-w-none">{e.title}</td>
                          <td className="hidden py-2.5 pr-3 text-[var(--muted-foreground)] sm:table-cell">{e.category}</td>
                          <td className="whitespace-nowrap py-2.5 pr-3 text-[var(--muted-foreground)]">{formatDate(e.date)}</td>
                          <td className="py-2.5 text-right font-semibold tabular-nums">
                            ৳{e.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
