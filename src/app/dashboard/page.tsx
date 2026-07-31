"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard, TrendAreaChart, IncomeExpenseBar, CategoryPie } from "@/components/dashboard/charts";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { useStore, useExpenseTotals } from "@/lib/store";
import { dailyTotals, categoryBreakdown, incomeVsExpense } from "@/lib/analytics";
import { currentMonthLabel, daysUntil, formatDate, todayISO } from "@/lib/format";
import { CATEGORY_COLORS } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const { expenses, income, budgets, bills, settings } = useStore();
  const totals = useExpenseTotals();
  const [formOpen, setFormOpen] = useState(false);

  const today = todayISO();
  const todayExpense = expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, []);
  const weekExpense = expenses
    .filter((e) => new Date(e.date + "T00:00:00") >= weekStart)
    .reduce((s, e) => s + e.amount, 0);

  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const upcomingBills = bills.filter((b) => !b.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);

  const trendData = useMemo(() => dailyTotals(expenses, 14), [expenses]);
  const catData = useMemo(() => categoryBreakdown(expenses.filter((e) => e.date >= today.slice(0, 8) + "01")), [expenses, today]);
  const ivsData = useMemo(() => incomeVsExpense(income, expenses, 6), [income, expenses]);

  const monthBudgets = budgets.filter((b) => b.month === today.slice(0, 7));
  const spentByCat = (cat: string) =>
    expenses.filter((e) => e.category === cat && e.date >= today.slice(0, 8) + "01").reduce((s, e) => s + e.amount, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {settings.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {currentMonthLabel()} · Here&apos;s your financial snapshot.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Add expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's expense"
          value={`৳${todayExpense.toLocaleString()}`}
          icon={CalendarDays}
          delay={0.02}
        />
        <StatCard
          label="This week"
          value={`৳${weekExpense.toLocaleString()}`}
          icon={Receipt}
          delay={0.06}
        />
        <StatCard
          label="This month"
          value={`৳${totals.monthlyExpenses.toLocaleString()}`}
          icon={TrendingUp}
          trend={8.2}
          delay={0.1}
        />
        <StatCard
          label="Total expenses"
          value={`৳${totals.totalExpenses.toLocaleString()}`}
          icon={CircleDollarSign}
          delay={0.14}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Current balance"
          value={`৳${(totals.totalIncome - totals.totalExpenses).toLocaleString()}`}
          sub="Income − expenses (all time)"
          icon={Wallet}
          delay={0.18}
        />
        <StatCard
          label="Remaining budget"
          value={`৳${Math.max(0, totals.remainingBudget).toLocaleString()}`}
          sub={`of ৳${totals.totalBudget.toLocaleString()} this month`}
          icon={PiggyBank}
          delay={0.22}
        />
        <StatCard
          label="Savings"
          value={`৳${Math.max(0, totals.savings).toLocaleString()}`}
          sub="All-time income − expenses"
          icon={ArrowUpRight}
          trend={12.4}
          delay={0.26}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Spending trend"
          subtitle="Last 14 days"
          className="lg:col-span-2"
        >
          <TrendAreaChart data={trendData} />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Budget health</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">Monthly progress by category</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthBudgets.length === 0 ? (
              <EmptyState
                title="No budgets yet"
                description="Create your first monthly budget."
                action={
                  <Link href="/dashboard/budgets">
                    <Button size="sm" variant="outline">
                      Create budget
                    </Button>
                  </Link>
                }
              />
            ) : (
              monthBudgets.slice(0, 5).map((b) => {
                const spent = spentByCat(b.category);
                const pct = Math.min(100, (spent / b.limit) * 100);
                const over = spent > b.limit;
                return (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium">{b.category}</span>
                      <span className={cn("tabular-nums", over ? "text-rose-500" : "text-[var(--muted-foreground)]")}>
                        {spent.toLocaleString()} / {b.limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      indicatorClassName={over ? "from-rose-500 to-rose-500" : undefined}
                    />
                    <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                      {over ? "Over budget!" : `${(100 - pct).toFixed(0)}% remaining`}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent transactions</CardTitle>
            <Link href="/dashboard/expenses" className="text-xs font-medium text-[var(--primary)] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState title="No expenses yet" description="Add your first expense to get started." />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recent.map((e, i) => (
                  <TransactionRow key={e.id} expense={e} index={i} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming bills</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">Don&apos;t miss a payment</p>
          </CardHeader>
          <CardContent>
            {upcomingBills.length === 0 ? (
              <EmptyState title="All caught up" description="No upcoming bills. Nice work!" icon={<Bell className="h-5 w-5" />} />
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((b) => {
                  const days = daysUntil(b.dueDate);
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <ArrowDownRight className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{b.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{formatDate(b.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">৳{b.amount.toLocaleString()}</p>
                        <Badge
                          variant={days <= 1 ? "danger" : days <= 3 ? "warning" : "secondary"}
                          className="mt-0.5 text-[10px]"
                        >
                          {days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `In ${days} days`}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Income vs expense" subtitle="Last 6 months">
          <IncomeExpenseBar data={ivsData} />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">This month</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
              <CategoryPie data={catData.map((c) => ({ category: c.category, total: c.total }))} height={200} />
              <div className="space-y-2">
                {catData.slice(0, 6).map((c) => (
                  <div key={c.category} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[c.category] }}
                      />
                      {c.category}
                    </span>
                    <span className="font-medium tabular-nums">৳{c.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ExpenseForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
