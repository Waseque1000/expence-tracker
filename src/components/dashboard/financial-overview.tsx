"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CreditCard,
  Building2,
  Wallet,
  Utensils,
  Car,
  ShoppingCart,
  Receipt,
  HeartPulse,
  Clapperboard,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowRight,
  DollarSign,
  PieChart as PieChartIcon,
  Home,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { useStore, useExpenseTotals } from "@/lib/store";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { CategoryIcon } from "@/components/category-icon";
import { PaymentBadge } from "@/components/dashboard/payment-badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatCompact, formatDate, monthKey, todayISO } from "@/lib/format";
import { CATEGORY_COLORS, type Category, type PaymentMethod } from "@/types";

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "#0f172a",
  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
  padding: "8px 12px",
};

// 8 core categories with distinct brand colors, pastel backgrounds, and icons
const DISPLAY_CATEGORIES = [
  {
    category: "House Rent" as Category,
    label: "House Rent",
    icon: Home,
    color: "#0284c7",
    trackColor: "#e0f2fe",
    bgColor: "bg-sky-50",
    textColor: "text-sky-600",
    border: "border-sky-200",
  },
  {
    category: "Fixed Bazar" as Category,
    label: "Fixed Bazar",
    icon: ShoppingBag,
    color: "#16a34a",
    trackColor: "#dcfce7",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    border: "border-emerald-200",
  },
  {
    category: "Utilities Bill" as Category,
    label: "Utilities Bill",
    icon: Zap,
    color: "#f59e0b",
    trackColor: "#fef3c7",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    border: "border-amber-200",
  },
  {
    category: "Food" as Category,
    label: "Food & Dining",
    icon: Utensils,
    color: "#ea580c",
    trackColor: "#ffedd5",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    border: "border-orange-200",
  },
  {
    category: "Transport" as Category,
    label: "Transport",
    icon: Car,
    color: "#3b82f6",
    trackColor: "#dbeafe",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    border: "border-blue-200",
  },
  {
    category: "Shopping" as Category,
    label: "Shopping",
    icon: ShoppingCart,
    color: "#ec4899",
    trackColor: "#fce7f3",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    border: "border-pink-200",
  },
  {
    category: "Bills" as Category,
    label: "Bills & Subs",
    icon: Receipt,
    color: "#8b5cf6",
    trackColor: "#ede9fe",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    border: "border-purple-200",
  },
  {
    category: "Medical" as Category,
    label: "Medical & Health",
    icon: HeartPulse,
    color: "#ef4444",
    trackColor: "#fee2e2",
    bgColor: "bg-rose-50",
    textColor: "text-rose-600",
    border: "border-rose-200",
  },
];

export function FinancialOverview() {
  const { expenses, income, budgets, settings } = useStore();
  const totals = useExpenseTotals();
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  const curMonthKey = monthKey(new Date());
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // 1. Account Balances breakdown based on user's real transactions
  const accounts = useMemo(() => {
    const net = totals.totalIncome - totals.totalExpenses;

    const byMethod: Record<string, number> = {
      Bank: 0,
      "Credit Card": 0,
      Cash: 0,
      Digital: 0,
    };

    // Calculate income by payment method or allocate
    income.forEach((i) => {
      byMethod.Bank += i.amount;
    });

    // Subtract expenses per payment method
    expenses.forEach((e) => {
      if (e.paymentMethod === "Bank" || e.paymentMethod === "Debit Card") {
        byMethod.Bank -= e.amount;
      } else if (e.paymentMethod === "Credit Card") {
        byMethod["Credit Card"] -= e.amount;
      } else if (e.paymentMethod === "Cash") {
        byMethod.Cash -= e.amount;
      } else {
        byMethod.Digital -= e.amount;
      }
    });

    return [
      {
        id: "bank",
        name: "Bank Account",
        balance: byMethod.Bank,
        iconBg: "bg-indigo-900 text-white",
        icon: Building2,
      },
      {
        id: "card",
        name: "Credit Card",
        balance: byMethod["Credit Card"],
        iconBg: "bg-purple-700 text-white",
        icon: CreditCard,
      },
      {
        id: "digital",
        name: "Digital Wallet",
        balance: byMethod.Digital,
        iconBg: "bg-sky-600 text-white",
        icon: DollarSign,
      },
      {
        id: "cash",
        name: "Cash",
        balance: byMethod.Cash,
        iconBg: "bg-zinc-800 text-white",
        icon: Wallet,
      },
    ];
  }, [income, expenses, totals]);

  // 2. 30-Day Cumulative Expenses calculation from real data
  const { cumulativeData, monthlyExpensesTotal, monthlyGrowth } = useMemo(() => {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = monthKey(prevMonthDate);

    const curMonthExpenses = expenses.filter((e) => monthKey(e.date) === curMonthKey);
    const prevMonthExpenses = expenses.filter((e) => monthKey(e.date) === prevMonthKey);

    const prevMonthTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const curMonthTotal = curMonthExpenses.reduce((s, e) => s + e.amount, 0);

    const growth =
      prevMonthTotal === 0
        ? curMonthTotal > 0
          ? 100
          : 0
        : ((curMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;

    // Cumulative sums per day (1 to 31)
    let curRunning = 0;
    let prevRunning = 0;

    const data = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const dayStr = String(day).padStart(2, "0");

      // Previous month cumulative
      const prevSpent = prevMonthExpenses
        .filter((e) => e.date.endsWith(`-${dayStr}`))
        .reduce((s, e) => s + e.amount, 0);
      prevRunning += prevSpent;

      // Current month cumulative (only up to current day)
      let curVal: number | null = null;
      if (day <= currentDay) {
        const curSpent = curMonthExpenses
          .filter((e) => e.date.endsWith(`-${dayStr}`))
          .reduce((s, e) => s + e.amount, 0);
        curRunning += curSpent;
        curVal = curRunning;
      }

      return {
        day: `${day}`,
        currentMonth: curVal,
        lastMonth: prevMonthTotal > 0 ? prevRunning : null,
      };
    });

    return {
      cumulativeData: data,
      monthlyExpensesTotal: curMonthTotal,
      monthlyGrowth: growth,
    };
  }, [expenses, curMonthKey, currentDay, now]);

  // 3. Category Donut Group
  const donutData = useMemo(() => {
    const curMonthExpenses = expenses.filter((e) => monthKey(e.date) === curMonthKey);
    const total = curMonthExpenses.reduce((s, e) => s + e.amount, 0);

    if (total === 0) return [];

    const map = new Map<Category, number>();
    curMonthExpenses.forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });

    return Array.from(map.entries())
      .map(([category, value]) => ({
        name: category,
        value,
        percent: ((value / total) * 100).toFixed(1) + "%",
        color: CATEGORY_COLORS[category] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, curMonthKey]);

  // 4. Monthly Budget vs Spent Chart
  const budgetProgressData = useMemo(() => {
    const totalBudget = totals.totalBudget;
    const curMonthExpenses = expenses.filter((e) => monthKey(e.date) === curMonthKey);

    let running = 0;
    const points: { day: string; spent: number | null; target: number }[] = [];

    // Step by 3-day intervals
    for (let day = 1; day <= daysInMonth; day += 3) {
      const dayStr = String(day).padStart(2, "0");
      const daySpent = curMonthExpenses
        .filter((e) => {
          const d = parseInt(e.date.split("-")[2], 10);
          return d <= day;
        })
        .reduce((s, e) => s + e.amount, 0);

      const target = totalBudget > 0 ? (totalBudget / daysInMonth) * day : 0;

      points.push({
        day: `${day}`,
        spent: day <= currentDay ? daySpent : null,
        target: Math.round(target),
      });
    }

    return points;
  }, [totals.totalBudget, expenses, curMonthKey, currentDay, daysInMonth]);

  // 5. 8 Budget Category Gauges
  const budgetRings = useMemo(() => {
    const curMonthExpenses = expenses.filter((e) => monthKey(e.date) === curMonthKey);

    return DISPLAY_CATEGORIES.map(
      ({ category, label, icon: Icon, color, trackColor, bgColor, textColor, border }) => {
        const budgetObj = budgets.find((b) => b.category === category && b.month === curMonthKey);
        const spent = curMonthExpenses
          .filter((e) => e.category === category)
          .reduce((s, e) => s + e.amount, 0);

        const limit = budgetObj?.limit ?? 0;
        const isOver = limit > 0 && spent > limit;
        const hasBudget = limit > 0;

        // 70% colorful gauge arc when zero so each ring is visually rich and distinct!
        const pct = hasBudget
          ? Math.min(100, Math.round((spent / limit) * 100))
          : spent > 0
          ? 100
          : 70;

        let status = "on track";
        if (hasBudget) {
          status = isOver ? "exceeded" : "remaining";
        } else if (spent > 0) {
          status = "spent";
        }

        return {
          id: category,
          name: label,
          spent,
          limit,
          status,
          pct,
          icon: Icon,
          isOver,
          hasBudget,
          color,
          trackColor,
          bgColor,
          textColor,
          border,
        };
      }
    );
  }, [expenses, budgets, curMonthKey]);

  // 6. Recent Transactions
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [expenses]);

  const netBalance = totals.totalIncome - totals.totalExpenses;
  const remainingBudget = Math.max(0, totals.remainingBudget);
  const diffBudget = Math.abs(totals.totalBudget - totals.monthlyExpenses);
  const isUnderBudget = totals.totalBudget >= totals.monthlyExpenses;

  return (
    <div className="w-full space-y-5 pb-8 text-slate-800 antialiased">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Overview</h2>
          <p className="text-xs text-slate-500">Real-time financial tracking & insights</p>
        </div>
        <Button
          onClick={() => setExpenseFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Grid: 3 columns x 2 rows on desktop */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ================= CARD 1: Account Balance ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="text-xs font-medium text-slate-500">Account Balance</div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatMoney(netBalance, settings.currency)}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>{accounts.length} accounts</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Updated just now
              </span>
            </div>
          </div>

          <div className="my-3 border-t border-slate-100" />

          {/* Accounts list */}
          <div className="space-y-3.5">
            {accounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <div key={acc.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] shadow-xs ${acc.iconBg}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-slate-700">{acc.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(acc.balance, settings.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= CARD 2: 30-Day Cumulative Expenses ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="text-xs font-medium text-slate-500">
              30-Day Cumulative Expenses
            </div>

            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {formatMoney(monthlyExpensesTotal, settings.currency)}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold">
              {monthlyGrowth >= 0 ? (
                <span className="flex items-center gap-1 text-rose-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{monthlyGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-500">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {monthlyGrowth.toFixed(1)}%
                </span>
              )}
              <span className="font-normal text-slate-400">vs last month</span>
            </div>
          </div>

          {/* Line Chart */}
          <div className="mt-3 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v === 0 ? "0" : formatCompact(v, settings.currency))}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: any) => [
                    formatMoney(Number(value), settings.currency),
                    name === "currentMonth" ? "Current month" : "Last month",
                  ]}
                />
                {/* Last month dashed line */}
                <Line
                  type="monotone"
                  dataKey="lastMonth"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
                {/* Current month solid green line */}
                <Line
                  type="monotone"
                  dataKey="currentMonth"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center justify-center gap-5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 bg-emerald-500 rounded-full" />
              <span>Current month</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-0.5 w-3.5 border-t border-dashed border-slate-400" />
              <span>Last month</span>
            </div>
          </div>
        </div>

        {/* ================= CARD 3: Expenses by Category ================= */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="text-xs font-medium text-slate-500">Expenses by Category</div>

          {donutData.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PieChartIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700">No expenses this month</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Add an expense to view category distribution
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpenseFormOpen(true)}
                className="mt-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add expense
              </Button>
            </div>
          ) : (
            <div className="relative my-auto flex h-52 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={95}
                    paddingAngle={2.5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, name: any, item: any) => [
                      `${formatMoney(Number(val), settings.currency)} (${item.payload.percent})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic top categories callouts */}
              {donutData.slice(0, 2).map((item, idx) => (
                <div
                  key={item.name}
                  className={`absolute flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] shadow-sm border border-slate-100 ${
                    idx === 0 ? "right-2 top-8" : "bottom-2 right-12"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="font-bold text-slate-800">{item.percent}</span>
                    <span className="ml-1 text-[10px] text-slate-400">
                      {formatCompact(item.value, settings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= CARD 4: Monthly Expenses vs Budget ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Monthly Expenses vs Budget</span>
              <Link
                href="/dashboard/budgets"
                className="flex items-center gap-1 font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                <span>BUDGET</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatMoney(remainingBudget, settings.currency)}{" "}
                <span className="text-base font-medium text-slate-500">remaining</span>
              </span>
            </div>

            <div className="mt-0.5 text-xs text-slate-400">
              Of {formatMoney(totals.totalBudget, settings.currency)} budgeted
            </div>
          </div>

          {/* Budget Chart */}
          <div className="relative mt-2 h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={budgetProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: any, name: any) => [
                    formatMoney(Number(val), settings.currency),
                    name === "spent" ? "Cumulative Spent" : "Budget Target",
                  ]}
                />
                {/* Target ceiling line */}
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                {/* Actual spending line */}
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Status pill badge */}
            {totals.totalBudget > 0 && (
              <div
                className={`absolute right-6 top-8 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ${
                  isUnderBudget ? "bg-emerald-600" : "bg-rose-600"
                }`}
              >
                <span>
                  {isUnderBudget
                    ? `↘ ${formatMoney(diffBudget, settings.currency)} under budget`
                    : `↗ ${formatMoney(diffBudget, settings.currency)} over budget`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= CARD 5: Budgets (8 Circular Progress Rings) ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tracking-wider text-slate-600">BUDGETS</span>
            <Link
              href="/dashboard/budgets"
              className="flex items-center gap-1 font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              <span>BUDGET</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* 4x2 Grid of Circular Category Gauges */}
          <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-3.5">
            {budgetRings.map((b) => {
              const Icon = b.icon;
              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (b.pct / 100) * circumference;
              const strokeColor = b.isOver ? "#ef4444" : b.color;

              return (
                <div key={b.id} className="group flex flex-col items-center text-center transition">
                  {/* Gauge SVG with centered icon */}
                  <div className="relative flex h-14 w-14 items-center justify-center">
                    <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 54 54">
                      {/* Pastel background track matching category tint */}
                      <circle
                        cx="27"
                        cy="27"
                        r={radius}
                        stroke={b.trackColor}
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      {/* Vibrant category progress ring */}
                      <circle
                        cx="27"
                        cy="27"
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth="3.5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Centered Icon with matching pastel tint and colored icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full ${b.bgColor} ${b.textColor} shadow-xs border ${b.border} transition group-hover:scale-105`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Spent Amount */}
                  <span
                    className={`mt-1 text-xs font-bold ${
                      b.isOver ? "text-rose-600" : "text-slate-800"
                    }`}
                  >
                    {formatCompact(b.spent, settings.currency)}
                  </span>

                  {/* Subtitle / Category Name */}
                  <span className="truncate w-full text-[9px] font-medium text-slate-500">{b.name}</span>

                  {/* Status label: "remaining", "exceeded", "on track" with color */}
                  <span
                    className={`text-[9px] font-semibold ${
                      b.isOver
                        ? "text-rose-500 font-bold"
                        : b.status === "remaining"
                        ? "text-emerald-600"
                        : b.textColor
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= CARD 6: Recent Transactions ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">Transactions</div>
              <div className="text-[10px] text-slate-400">Most recent</div>
            </div>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-0.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
            >
              <span>All transactions</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* List of recent transactions */}
          {recentTransactions.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Receipt className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-700">No transactions yet</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Your recent expenses will appear here
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpenseFormOpen(true)}
                className="mt-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add expense
              </Button>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const color = CATEGORY_COLORS[tx.category] || "#3b82f6";
                return (
                  <div
                    key={tx.id}
                    className="group flex items-center justify-between py-2.5 transition hover:bg-slate-50/50 rounded-lg px-1.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        <CategoryIcon category={tx.category} className="h-3.5 w-3.5 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                          {tx.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="truncate">{tx.category}</span>
                          <span>•</span>
                          <span className="shrink-0">{formatDate(tx.date, { month: "short", day: "numeric" })}</span>
                          <PaymentBadge method={tx.paymentMethod} className="scale-90 origin-left px-1.5 py-0 text-[9px]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pl-2">
                      <span className="text-[11px] font-semibold text-slate-700">
                        - {formatMoney(tx.amount, settings.currency)}
                      </span>
                      <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm open={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} />
    </div>
  );
}
