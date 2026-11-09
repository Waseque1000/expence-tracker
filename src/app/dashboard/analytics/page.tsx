"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Brain,
  CalendarClock,
  Flame,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
  Plus,
  X,
  Calendar,
  Layers,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartCard, TrendAreaChart, IncomeExpenseBar, CategoryPie } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { useStore, useExpenseTotals } from "@/lib/store";
import {
  dailyTotals,
  weeklyTotals,
  monthlyTotals,
  categoryBreakdown,
  incomeVsExpense,
  getStats,
} from "@/lib/analytics";
import { monthKey, formatMoney, formatCompact } from "@/lib/format";
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/types";
import { CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

const MONTH_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#ef4444", // Red
  "#6366f1", // Indigo
];

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "#0f172a",
  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
  padding: "8px 12px",
};

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AnalyticsPage() {
  const { expenses, income, settings } = useStore();
  const totals = useExpenseTotals();
  const [range, setRange] = useState("week");
  const [insightKey, setInsightKey] = useState(0);

  // All available months
  const allAvailableMonths = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      set.add(monthKey(d));
    }
    expenses.forEach((e) => set.add(monthKey(e.date)));
    income.forEach((i) => set.add(monthKey(i.date)));
    return Array.from(set).sort().reverse();
  }, [expenses, income]);

  // Selected months for multi-month comparison (defaults to current month and previous month)
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() => {
    const m1 = allAvailableMonths[0] || monthKey(new Date());
    const m2 = allAvailableMonths[1] || monthKey(new Date(Date.now() - 30 * 86400000));
    return [m1, m2];
  });

  // Months available to add
  const unselectedMonths = useMemo(
    () => allAvailableMonths.filter((m) => !selectedMonths.includes(m)),
    [allAvailableMonths, selectedMonths]
  );

  const [addMonthSelect, setAddMonthSelect] = useState("");

  const handleAddMonth = (mKey: string) => {
    if (!mKey || selectedMonths.includes(mKey)) return;
    setSelectedMonths([...selectedMonths, mKey]);
    setAddMonthSelect("");
  };

  const handleRemoveMonth = (mKey: string) => {
    if (selectedMonths.length <= 1) return; // Keep at least one
    setSelectedMonths(selectedMonths.filter((m) => m !== mKey));
  };

  const setPreset = (type: "2m" | "3m" | "6m") => {
    const count = type === "2m" ? 2 : type === "3m" ? 3 : 6;
    setSelectedMonths(allAvailableMonths.slice(0, count));
  };

  // Month-by-month detailed data map for selected months
  const monthsData = useMemo(() => {
    return selectedMonths.map((mKey, idx) => {
      const monthExpenses = expenses.filter((e) => monthKey(e.date) === mKey);
      const monthIncome = income.filter((i) => monthKey(i.date) === mKey);

      const totalExp = monthExpenses.reduce((s, e) => s + e.amount, 0);
      const totalInc = monthIncome.reduce((s, i) => s + i.amount, 0);
      const net = totalInc - totalExp;
      const savingsRate = totalInc > 0 ? (net / totalInc) * 100 : 0;
      const cats = categoryBreakdown(monthExpenses);
      const topCat = cats[0] || null;

      const catMap = new Map<Category, number>();
      monthExpenses.forEach((e) => catMap.set(e.category, (catMap.get(e.category) ?? 0) + e.amount));

      return {
        monthKey: mKey,
        label: formatMonthLabel(mKey),
        color: MONTH_COLORS[idx % MONTH_COLORS.length],
        totalExpense: totalExp,
        totalIncome: totalInc,
        net,
        savingsRate,
        topCategory: topCat,
        txCount: monthExpenses.length,
        catMap,
      };
    });
  }, [selectedMonths, expenses, income]);

  // Active categories that have spending in any of the compared months
  const activeComparisonCategories = useMemo(() => {
    const set = new Set<Category>();
    monthsData.forEach((m) => {
      m.catMap.forEach((val, cat) => {
        if (val > 0) set.add(cat);
      });
    });
    // If empty, fallback to top standard categories
    if (set.size === 0) {
      return CATEGORIES.slice(0, 8);
    }
    return Array.from(set);
  }, [monthsData]);

  // Grouped bar chart data: one row per category with a key for each month
  const categoryComparisonChartData = useMemo(() => {
    return activeComparisonCategories.map((cat) => {
      const row: Record<string, any> = { category: cat };
      monthsData.forEach((m) => {
        row[m.monthKey] = m.catMap.get(cat) ?? 0;
      });
      return row;
    });
  }, [activeComparisonCategories, monthsData]);

  // General historical metrics
  const stats = useMemo(() => getStats(expenses, income), [expenses, income]);
  const weekData = useMemo(() => dailyTotals(expenses, 7), [expenses]);
  const monthData = useMemo(() => weeklyTotals(expenses), [expenses]);
  const yearData = useMemo(() => monthlyTotals(expenses, 12), [expenses]);
  const catData = useMemo(() => categoryBreakdown(expenses), [expenses]);
  const ivsData = useMemo(() => incomeVsExpense(income, expenses, 8), [income, expenses]);

  const rangeData =
    range === "week" ? weekData : range === "month" ? monthData : yearData;

  // AI Insights
  const insights = useMemo(() => {
    const m1 = monthsData[0];
    const m2 = monthsData[1];
    const items: { title: string; desc: string; tone: "info" | "success" | "warning" }[] = [];

    if (m1 && m2 && m2.totalExpense > 0) {
      const diff = ((m1.totalExpense - m2.totalExpense) / m2.totalExpense) * 100;
      items.push({
        title:
          diff >= 0
            ? `Spending increased by ${diff.toFixed(1)}% vs ${m2.label}`
            : `Spending decreased by ${Math.abs(diff).toFixed(1)}% vs ${m2.label}`,
        desc:
          diff >= 0
            ? `You spent ${formatMoney(m1.totalExpense - m2.totalExpense, settings.currency)} more in ${m1.label}. Consider reviewing non-essential categories to reduce expenses.`
            : `Great job! You saved ${formatMoney(m2.totalExpense - m1.totalExpense, settings.currency)} compared to ${m2.label}. Keep up the momentum!`,
        tone: diff >= 0 ? "warning" : "success",
      });
    }

    if (m1?.topCategory) {
      items.push({
        title: `${m1.topCategory.category} is your highest category in ${m1.label}`,
        desc: `You spent ${formatMoney(m1.topCategory.total, settings.currency)} on ${m1.topCategory.category}. This represents ${((m1.topCategory.total / Math.max(1, m1.totalExpense)) * 100).toFixed(0)}% of your total monthly outflow.`,
        tone: "info",
      });
    }

    if (m1 && m1.savingsRate > 0) {
      items.push({
        title: `${m1.label} Savings Rate: ${m1.savingsRate.toFixed(1)}%`,
        desc:
          m1.savingsRate >= 20
            ? "You are maintaining a healthy 20%+ savings rate. Great discipline!"
            : "Aim to allocate at least 20% of your income toward savings and investments.",
        tone: m1.savingsRate >= 20 ? "success" : "info",
      });
    } else {
      items.push({
        title: "Track Income & Savings",
        desc: "Add your monthly income to unlock savings rate tracking and deeper surplus calculations.",
        tone: "info",
      });
    }

    return items;
  }, [monthsData, settings.currency]);

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Page Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Comparisons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare monthly performance, track trends, and discover actionable financial insights
          </p>
        </div>
        <Badge variant="info" className="gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Real-time Analytics
        </Badge>
      </div>

      {/* ================= SECTION: MONTH-OVER-MONTH COMPARISON ENGINE ================= */}
      <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </span>
                <CardTitle className="text-base font-bold text-slate-900">
                  Month-Over-Month Comparison
                </CardTitle>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Compare {selectedMonths.length} months side-by-side. Add or remove months to customize your view.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1">Presets:</span>
              <button
                onClick={() => setPreset("2m")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                2 Months
              </button>
              <button
                onClick={() => setPreset("3m")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                3 Months
              </button>
              <button
                onClick={() => setPreset("6m")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                6 Months
              </button>
            </div>
          </div>

          {/* Active Month Chips & Add Month Dropdown */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Compared Months:</span>
            {monthsData.map((m) => (
              <span
                key={m.monthKey}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.label}</span>
                {selectedMonths.length > 1 && (
                  <button
                    onClick={() => handleRemoveMonth(m.monthKey)}
                    className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    title={`Remove ${m.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}

            {/* Dropdown to add more months */}
            {unselectedMonths.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={addMonthSelect}
                  onChange={(e) => handleAddMonth(e.target.value)}
                  className="h-8 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition focus:outline-none"
                >
                  <option value="">+ Add More Month...</option>
                  {unselectedMonths.map((mKey) => (
                    <option key={mKey} value={mKey}>
                      + {formatMonthLabel(mKey)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {/* Side-by-Side Comparison Metric Cards */}
          <div className={`grid gap-4 ${selectedMonths.length === 2 ? "sm:grid-cols-2" : selectedMonths.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
            {monthsData.map((m, idx) => {
              // Comparison with previous selected month if available
              const nextMonth = monthsData[idx + 1];
              let diffText = "";
              let isDiffUp = false;
              if (nextMonth && nextMonth.totalExpense > 0) {
                const diffPct = ((m.totalExpense - nextMonth.totalExpense) / nextMonth.totalExpense) * 100;
                isDiffUp = diffPct >= 0;
                diffText = `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}% vs ${nextMonth.label}`;
              }

              return (
                <div
                  key={m.monthKey}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 inset-x-0 h-1"
                    style={{ backgroundColor: m.color }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {m.txCount} txs
                    </Badge>
                  </div>

                  {/* Total Expense */}
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {formatMoney(m.totalExpense, settings.currency)}
                  </p>

                  {/* Comparison vs next month */}
                  {diffText && (
                    <p
                      className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${
                        isDiffUp ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {isDiffUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{diffText}</span>
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Income:</span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(m.totalIncome, settings.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Net Savings:</span>
                      <span
                        className={`font-semibold ${
                          m.net >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {formatMoney(m.net, settings.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Top Category:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                        {m.topCategory ? m.topCategory.category : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grouped Bar Chart Comparing Categories Across Selected Months */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Comparison</h3>
                <p className="text-xs text-slate-500">
                  Side-by-side spending breakdown across compared months
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {monthsData.map((m) => (
                  <span key={m.monthKey} className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryComparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
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
                      formatMonthLabel(name),
                    ]}
                  />
                  {monthsData.map((m) => (
                    <Bar
                      key={m.monthKey}
                      dataKey={m.monthKey}
                      name={m.monthKey}
                      fill={m.color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Category-by-Category Comparison Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Category Comparison Table</h3>
            <p className="text-xs text-slate-500">
              Detailed numerical breakdown and variance between months
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    {monthsData.map((m) => (
                      <th key={m.monthKey} className="py-2.5 px-3 font-semibold text-right">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                          {m.label}
                        </span>
                      </th>
                    ))}
                    {monthsData.length >= 2 && (
                      <th className="py-2.5 px-3 font-semibold text-right">
                        Variance ({monthsData[0].label} vs {monthsData[1].label})
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeComparisonCategories.map((cat) => {
                    const color = CATEGORY_COLORS[cat] || "#64748b";
                    const val0 = monthsData[0]?.catMap.get(cat) ?? 0;
                    const val1 = monthsData[1]?.catMap.get(cat) ?? 0;
                    const diff = val0 - val1;
                    const diffPct = val1 > 0 ? (diff / val1) * 100 : val0 > 0 ? 100 : 0;

                    return (
                      <tr key={cat} className="transition hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                            <CategoryIcon category={cat} className="h-3.5 w-3.5 text-slate-500" />
                            <span>{cat}</span>
                          </span>
                        </td>
                        {monthsData.map((m) => {
                          const spent = m.catMap.get(cat) ?? 0;
                          return (
                            <td key={m.monthKey} className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-800">
                              {formatMoney(spent, settings.currency)}
                            </td>
                          );
                        })}
                        {monthsData.length >= 2 && (
                          <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                            {val0 === 0 && val1 === 0 ? (
                              <span className="text-slate-300 font-normal">—</span>
                            ) : diff === 0 ? (
                              <span className="text-slate-500 font-normal">0%</span>
                            ) : diff > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-rose-600">
                                <TrendingUp className="h-3 w-3" />
                                +{formatMoney(diff, settings.currency)} (+{diffPct.toFixed(0)}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-emerald-600">
                                <TrendingDown className="h-3 w-3" />
                                -{formatMoney(Math.abs(diff), settings.currency)} ({diffPct.toFixed(0)}%)
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= SECTION: AI INSIGHTS ================= */}
      <Card className="border-emerald-200/80 bg-linear-to-r from-emerald-50/30 to-blue-50/30 shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-xs">
              <Brain className="h-4.5 w-4.5" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Comparative AI Insights</CardTitle>
              <p className="text-xs text-slate-500">Generated from your real spending variance</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInsightKey((k) => k + 1)}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div key={insightKey} className="grid gap-3 md:grid-cols-3">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "rounded-2xl border p-4 bg-white shadow-2xs",
                  ins.tone === "warning" && "border-amber-200 text-amber-900",
                  ins.tone === "success" && "border-emerald-200 text-emerald-900",
                  ins.tone === "info" && "border-sky-200 text-sky-900"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-bold",
                    ins.tone === "warning" && "text-amber-700",
                    ins.tone === "success" && "text-emerald-700",
                    ins.tone === "info" && "text-sky-700"
                  )}
                >
                  {ins.title}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{ins.desc}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================= SECTION: OVERALL HISTORICAL TRENDS & CATEGORY PIE ================= */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Spending Trend" subtitle="Daily · Weekly · Monthly trajectory">
          <Tabs
            defaultValue="week"
            tabs={[
              { value: "week", label: "Daily (7d)" },
              { value: "month", label: "Weekly" },
              { value: "year", label: "Monthly" },
            ]}
            onValueChange={setRange}
          >
            {() => (
              <div className="mt-4">
                <TrendAreaChart data={rangeData} height={280} />
              </div>
            )}
          </Tabs>
        </ChartCard>

        <Card className="border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">All-Time Category Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution across all recorded expenses</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <CategoryPie
              data={catData.map((c) => ({ category: c.category, total: c.total }))}
              height={230}
            />
            <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
              {catData.map((c) => {
                const color = CATEGORY_COLORS[c.category] || "#94a3b8";
                return (
                  <div key={c.category} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate">{c.category}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-800">
                      {formatMoney(c.total, settings.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
