"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  TrendingUp,
  Receipt,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { categoryBreakdown } from "@/lib/analytics";
import { formatMoney, formatCompact, formatDate, monthKey, toISODate } from "@/lib/format";
import { CATEGORY_COLORS, type Expense, type Category } from "@/types";
import { CategoryIcon } from "@/components/category-icon";
import { PaymentBadge } from "@/components/dashboard/payment-badge";
import { useToast } from "@/components/ui/toast";

type ViewMode = "monthly" | "weekly" | "custom";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "#0f172a",
  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
  padding: "8px 12px",
};

export default function ReportsPage() {
  const { expenses, income, settings } = useStore();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  // Available unique months from transactions or past 12 months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    // Default last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      set.add(monthKey(d));
    }
    expenses.forEach((e) => set.add(monthKey(e.date)));
    income.forEach((i) => set.add(monthKey(i.date)));
    return Array.from(set).sort().reverse();
  }, [expenses, income]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKey(new Date()));

  // Available weeks (last 12 weeks)
  const availableWeeks = useMemo(() => {
    const weeks: { id: string; label: string; start: string; end: string }[] = [];
    const now = new Date();
    for (let w = 0; w < 12; w++) {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay() - w * 7); // Start on Sunday
      const start = toISODate(d);
      const endD = new Date(d);
      endD.setDate(endD.getDate() + 6); // End on Saturday
      const end = toISODate(endD);

      const label =
        w === 0
          ? `This Week (${formatDate(start, { month: "short", day: "numeric" })} – ${formatDate(end, { month: "short", day: "numeric" })})`
          : w === 1
          ? `Last Week (${formatDate(start, { month: "short", day: "numeric" })} – ${formatDate(end, { month: "short", day: "numeric" })})`
          : `${formatDate(start, { month: "short", day: "numeric" })} – ${formatDate(end, { month: "short", day: "numeric" })}`;

      weeks.push({ id: start, label, start, end });
    }
    return weeks;
  }, []);

  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => availableWeeks[0]?.id || "");

  // Custom date range state
  const [customFrom, setCustomFrom] = useState(() =>
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Active date range based on viewMode
  const activeRange = useMemo((): { from: string; to: string; label: string } => {
    if (viewMode === "monthly") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const from = `${selectedMonth}-01`;
      const to = `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;
      const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { from, to, label: `${monthLabel} Statement` };
    }

    if (viewMode === "weekly") {
      const week = availableWeeks.find((w) => w.id === selectedWeekId) || availableWeeks[0];
      return { from: week.start, to: week.end, label: `${week.label} Statement` };
    }

    return {
      from: customFrom,
      to: customTo,
      label: `${formatDate(customFrom)} – ${formatDate(customTo)} Report`,
    };
  }, [viewMode, selectedMonth, selectedWeekId, availableWeeks, customFrom, customTo]);

  // Filtered transactions for the selected range
  const filteredExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date >= activeRange.from && e.date <= activeRange.to)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, activeRange]
  );

  const filteredIncome = useMemo(
    () =>
      income
        .filter((i) => i.date >= activeRange.from && i.date <= activeRange.to)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [income, activeRange]
  );

  const totalExpense = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );
  const totalIncome = useMemo(
    () => filteredIncome.reduce((s, i) => s + i.amount, 0),
    [filteredIncome]
  );
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const cats = useMemo(() => categoryBreakdown(filteredExpenses), [filteredExpenses]);
  const biggestExpense = useMemo(
    () =>
      filteredExpenses.reduce((m, e) => (e.amount > m.amount ? e : m), {
        title: "—",
        amount: 0,
      } as Pick<Expense, "title" | "amount">),
    [filteredExpenses]
  );

  // Month-by-month aggregated breakdown table & chart
  const monthWiseComparison = useMemo(() => {
    return availableMonths.slice(0, 8).map((mKey) => {
      const [y, m] = mKey.split("-").map(Number);
      const label = new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const exp = expenses.filter((e) => monthKey(e.date) === mKey).reduce((s, e) => s + e.amount, 0);
      const inc = income.filter((i) => monthKey(i.date) === mKey).reduce((s, i) => s + i.amount, 0);
      const topCat = categoryBreakdown(expenses.filter((e) => monthKey(e.date) === mKey))[0]?.category || "—";
      const txCount = expenses.filter((e) => monthKey(e.date) === mKey).length;

      return {
        monthKey: mKey,
        label,
        expense: exp,
        income: inc,
        net: inc - exp,
        topCategory: topCat,
        txCount,
      };
    });
  }, [availableMonths, expenses, income]);

  // Week-by-week aggregated breakdown table & chart
  const weekWiseComparison = useMemo(() => {
    return availableWeeks.slice(0, 8).map((w) => {
      const weekExpenses = expenses.filter((e) => e.date >= w.start && e.date <= w.end);
      const exp = weekExpenses.reduce((s, e) => s + e.amount, 0);
      const weekIncome = income.filter((i) => i.date >= w.start && i.date <= w.end);
      const inc = weekIncome.reduce((s, i) => s + i.amount, 0);
      const topCat = categoryBreakdown(weekExpenses)[0]?.category || "—";

      return {
        id: w.id,
        label: w.label.split(" (")[0],
        dateSpan: w.label.includes("(") ? w.label.split("(")[1].replace(")", "") : w.label,
        expense: exp,
        income: inc,
        net: inc - exp,
        topCategory: topCat,
        txCount: weekExpenses.length,
      };
    });
  }, [availableWeeks, expenses, income]);

  // Daily totals for the selected week
  const selectedWeekDailyData = useMemo(() => {
    if (viewMode !== "weekly") return [];
    const week = availableWeeks.find((w) => w.id === selectedWeekId) || availableWeeks[0];
    const days: { day: string; date: string; expense: number }[] = [];

    const startD = new Date(week.start + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      const curD = new Date(startD);
      curD.setDate(curD.getDate() + i);
      const dStr = toISODate(curD);
      const dayName = curD.toLocaleDateString("en-US", { weekday: "short" });
      const dayTotal = expenses
        .filter((e) => e.date === dStr)
        .reduce((s, e) => s + e.amount, 0);

      days.push({
        day: dayName,
        date: dStr,
        expense: dayTotal,
      });
    }
    return days;
  }, [viewMode, selectedWeekId, availableWeeks, expenses]);

  // Previous month/week comparison percentage
  const comparisonGrowth = useMemo(() => {
    if (viewMode === "monthly") {
      const curIdx = availableMonths.indexOf(selectedMonth);
      if (curIdx >= 0 && curIdx < availableMonths.length - 1) {
        const prevKey = availableMonths[curIdx + 1];
        const prevTotal = expenses
          .filter((e) => monthKey(e.date) === prevKey)
          .reduce((s, e) => s + e.amount, 0);
        if (prevTotal === 0) return totalExpense > 0 ? 100 : 0;
        return ((totalExpense - prevTotal) / prevTotal) * 100;
      }
    }
    return null;
  }, [viewMode, selectedMonth, availableMonths, expenses, totalExpense]);

  // CSV Export logic
  const csvContent = useMemo(() => {
    const rows = [
      ["Title", "Amount", "Category", "Payment Method", "Date", "Notes"],
      ...filteredExpenses.map((e) => [
        `"${e.title.replace(/"/g, '""')}"`,
        e.amount,
        `"${e.category}"`,
        `"${e.paymentMethod}"`,
        e.date,
        `"${(e.notes || "").replace(/"/g, '""')}"`,
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

  const handleCsvExport = () => {
    downloadFile(
      csvContent,
      `expenseflow-${viewMode}-${activeRange.from}-to-${activeRange.to}.csv`,
      "text/csv;charset=utf-8"
    );
    toast({
      title: "CSV Exported",
      description: `${filteredExpenses.length} transactions exported`,
      type: "success",
    });
  };

  const handleExcelExport = () => {
    downloadFile(
      "\ufeff" + csvContent,
      `expenseflow-${viewMode}-${activeRange.from}-to-${activeRange.to}.xls`,
      "application/vnd.ms-excel"
    );
    toast({
      title: "Excel Exported",
      description: `${filteredExpenses.length} transactions exported`,
      type: "success",
    });
  };

  const handlePrintPdf = () => {
    window.print();
    toast({
      title: "Print / PDF Opened",
      description: "Use browser Save as PDF to download",
      type: "info",
    });
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[idx + 1]);
    }
  };

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) {
      setSelectedMonth(availableMonths[idx - 1]);
    }
  };

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, analyze, and export your month-wise and weekly financial performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCsvExport} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5 text-slate-600" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExcelExport} className="h-9 gap-1.5 text-xs">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintPdf} className="h-9 gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 text-blue-600" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Main View Mode Selector (Month-wise vs Weekly vs Custom) */}
      <Card className="border-slate-200/80 bg-white shadow-sm print:hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* View Mode Tabs */}
            <Tabs
              defaultValue={viewMode}
              tabs={[
                { value: "monthly", label: "Month-Wise Report", icon: <CalendarDays className="h-4 w-4" /> },
                { value: "weekly", label: "Weekly Report", icon: <BarChart3 className="h-4 w-4" /> },
                { value: "custom", label: "Custom Range", icon: <Calendar className="h-4 w-4" /> },
              ]}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            />

            {/* Sub-selectors depending on active viewMode */}
            <div className="flex items-center gap-2">
              {viewMode === "monthly" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevMonth}
                    disabled={availableMonths.indexOf(selectedMonth) >= availableMonths.length - 1}
                    className="h-9 w-9 p-0"
                    title="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {availableMonths.map((mKey) => {
                      const [y, m] = mKey.split("-").map(Number);
                      const label = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      });
                      return (
                        <option key={mKey} value={mKey}>
                          {label}
                        </option>
                      );
                    })}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    disabled={availableMonths.indexOf(selectedMonth) <= 0}
                    className="h-9 w-9 p-0"
                    title="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {viewMode === "weekly" && (
                <select
                  value={selectedWeekId}
                  onChange={(e) => setSelectedWeekId(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableWeeks.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label}
                    </option>
                  ))}
                </select>
              )}

              {viewMode === "custom" && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Report Container */}
      <div id="report" className="space-y-5">
        {/* Banner with Totals and Key Insights */}
        <motion.div
          key={activeRange.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  {viewMode === "monthly" ? "Monthly Report" : viewMode === "weekly" ? "Weekly Report" : "Custom Report"}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{activeRange.label}</span>
              </div>
              <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {formatMoney(totalExpense, settings.currency)}
                <span className="ml-2 text-sm font-medium text-slate-500">total expenses</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-right">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs py-1">
                Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Badge>
            </div>
          </div>

          {/* Key Stat Tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Total Income
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatMoney(totalIncome, settings.currency)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <PiggyBank className="h-3.5 w-3.5 text-blue-600" /> Net Savings
              </div>
              <p
                className={`mt-1 text-lg font-bold ${
                  netSavings >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatMoney(netSavings, settings.currency)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Receipt className="h-3.5 w-3.5 text-purple-600" /> Transactions
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">{filteredExpenses.length} entries</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" /> Biggest Expense
              </div>
              <p className="mt-1 truncate text-lg font-bold text-slate-900">
                {formatMoney(biggestExpense.amount, settings.currency)}
              </p>
              <p className="truncate text-[10px] text-slate-400">{biggestExpense.title}</p>
            </div>
          </div>
        </motion.div>

        {/* ================= VIEW-SPECIFIC SECTION ================= */}

        {/* 1. If MONTH-WISE VIEW: Show Month-by-Month comparison chart & comparison table */}
        {viewMode === "monthly" && (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Multi-Month Bar Comparison Chart */}
            <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Month-Wise Trend</h3>
                  <p className="text-xs text-slate-400">Income vs Expenses over recent months</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Expenses
                  </span>
                </div>
              </div>

              <div className="mt-4 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...monthWiseComparison].reverse()} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v === 0 ? "0" : formatCompact(v, settings.currency))}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any, name: any) => [
                        formatMoney(Number(val), settings.currency),
                        name === "income" ? "Income" : "Expense",
                      ]}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Month-Wise Summary Table */}
            <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-900">Months Overview</h3>
              <p className="text-xs text-slate-400">Quick performance summary</p>

              <div className="mt-4 max-h-[240px] overflow-auto divide-y divide-slate-100">
                {monthWiseComparison.map((m) => {
                  const isSelected = m.monthKey === selectedMonth;
                  return (
                    <div
                      key={m.monthKey}
                      onClick={() => setSelectedMonth(m.monthKey)}
                      className={`flex cursor-pointer items-center justify-between py-2.5 px-2 rounded-lg transition ${
                        isSelected ? "bg-emerald-50 text-emerald-900 font-semibold" : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.label}</p>
                        <p className="text-[10px] text-slate-400">{m.txCount} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-rose-600">
                          {formatMoney(m.expense, settings.currency)}
                        </p>
                        <p className="text-[10px] text-emerald-600">
                          +{formatMoney(m.income, settings.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* 2. If WEEKLY VIEW: Show Daily Bar Breakdown for selected week & Week comparison table */}
        {viewMode === "weekly" && (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Daily breakdown bar chart for the week */}
            <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Spending This Week</h3>
                  <p className="text-xs text-slate-400">Expenses by day (Sunday – Saturday)</p>
                </div>
                <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                  {formatMoney(totalExpense, settings.currency)} total
                </Badge>
              </div>

              <div className="mt-4 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedWeekDailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v === 0 ? "0" : formatCompact(v, settings.currency))}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [formatMoney(Number(val), settings.currency), "Spent"]}
                    />
                    <Bar dataKey="expense" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Weeks Comparison Table */}
            <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-900">Recent Weeks</h3>
              <p className="text-xs text-slate-400">Click to inspect any week</p>

              <div className="mt-4 max-h-[240px] overflow-auto divide-y divide-slate-100">
                {weekWiseComparison.map((w) => {
                  const isSelected = w.id === selectedWeekId;
                  return (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWeekId(w.id)}
                      className={`flex cursor-pointer items-center justify-between py-2.5 px-2 rounded-lg transition ${
                        isSelected ? "bg-blue-50 text-blue-900 font-semibold" : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{w.label}</p>
                        <p className="text-[10px] text-slate-400">{w.dateSpan}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-rose-600">
                          {formatMoney(w.expense, settings.currency)}
                        </p>
                        <p className="text-[10px] text-slate-400">{w.txCount} txs</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Detailed Breakdown: Category Breakdown + Transactions Ledger */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Category Breakdown Card */}
          <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-900">Category Breakdown</h3>
            <p className="text-xs text-slate-400">{activeRange.label}</p>

            <div className="mt-4 space-y-3.5">
              {cats.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No expenses in this period.</p>
              ) : (
                cats.map((c) => {
                  const pct = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0;
                  const color = CATEGORY_COLORS[c.category] || "#94a3b8";
                  return (
                    <div key={c.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                          {c.category}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatMoney(c.total, settings.currency)}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Full Transactions Ledger for this Period */}
          <Card className="border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transactions Ledger</h3>
                <p className="text-xs text-slate-400">{filteredExpenses.length} entries in this period</p>
              </div>
            </div>

            <div className="mt-4">
              {filteredExpenses.length === 0 ? (
                <EmptyState
                  title="No transactions recorded"
                  description="There are no expenses in this timeframe."
                />
              ) : (
                <div className="max-h-[380px] overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2.5 px-3 font-semibold">Title</th>
                        <th className="py-2.5 px-3 font-semibold">Category</th>
                        <th className="py-2.5 px-3 font-semibold">Payment</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenses.map((e) => {
                        const color = CATEGORY_COLORS[e.category] || "#3b82f6";
                        return (
                          <tr key={e.id} className="transition hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              <p className="truncate max-w-[140px] sm:max-w-xs">{e.title}</p>
                              {e.notes && <p className="truncate text-[10px] text-slate-400">{e.notes}</p>}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                                {e.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <PaymentBadge method={e.paymentMethod} />
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                              {formatDate(e.date)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold tabular-nums text-slate-900">
                              - {formatMoney(e.amount, settings.currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
