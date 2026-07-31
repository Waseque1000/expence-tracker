"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Brain,
  CalendarClock,
  Flame,
  PiggyBank,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
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
import { monthKey } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { expenses, income, budgets } = useStore();
  const totals = useExpenseTotals();
  const [range, setRange] = useState("week");
  const [insightKey, setInsightKey] = useState(0);

  const stats = useMemo(() => getStats(expenses, income), [expenses, income]);
  const weekData = useMemo(() => dailyTotals(expenses, 7), [expenses]);
  const monthData = useMemo(() => weeklyTotals(expenses), [expenses]);
  const yearData = useMemo(() => monthlyTotals(expenses, 12), [expenses]);
  const catData = useMemo(() => categoryBreakdown(expenses), [expenses]);
  const ivsData = useMemo(() => incomeVsExpense(income, expenses, 8), [income, expenses]);

  const rangeData =
    range === "week" ? weekData : range === "month" ? monthData : yearData;

  const insights = useMemo(() => {
    const mk = monthKey(new Date());
    const thisMonth = expenses.filter((e) => monthKey(e.date) === mk).reduce((s, e) => s + e.amount, 0);
    const lastMonth = expenses
      .filter((e) => monthKey(e.date) === monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)))
      .reduce((s, e) => s + e.amount, 0);

    const top = stats.highest;
    const foodThis = expenses.filter((e) => e.category === "Food" && monthKey(e.date) === mk).reduce((s, e) => s + e.amount, 0);
    const foodLast = expenses
      .filter((e) => e.category === "Food" && monthKey(e.date) === monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)))
      .reduce((s, e) => s + e.amount, 0);

    const growth = lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;
    const items: { title: string; desc: string; tone: "info" | "success" | "warning" }[] = [];

    if (foodLast > 0) {
      const diff = ((foodThis - foodLast) / foodLast) * 100;
      items.push({
        title: diff >= 5 ? `Food spending up ${Math.round(diff)}%` : `Food spending down ${Math.abs(Math.round(diff))}%`,
        desc:
          diff >= 5
            ? "You spent more on Food than last month. Consider meal planning to bring this down."
            : "Great job cutting Food costs — keep up the momentum!",
        tone: diff >= 5 ? "warning" : "success",
      });
    }

    if (top) {
      items.push({
        title: `${top.category} is your biggest category`,
        desc: `You've spent ৳${top.total.toLocaleString()} on ${top.category}. ${
          top.category === "Shopping" || top.category === "Entertainment"
            ? `You could save about ৳${Math.round(top.total * 0.2 / 100) * 100} by trimming non-essentials here.`
            : "This looks reasonable for an essential category."
        }`,
        tone: "info",
      });
    }

    items.push({
      title: growth >= 0 ? `Monthly spending grew ${Math.round(growth)}%` : `Spending down ${Math.abs(Math.round(growth))}% vs last month`,
      desc:
        growth >= 0
          ? "Your outflows increased this month. Review your variable expenses for quick wins."
          : "You're spending less than last month. Excellent financial discipline!",
      tone: growth >= 0 ? "warning" : "success",
    });

    if (stats.savingsRate > 0) {
      items.push({
        title: `Savings rate at ${stats.savingsRate.toFixed(1)}%`,
        desc:
          stats.savingsRate >= 20
            ? "You're saving a healthy share of income. Aim for 20%+ to build wealth steadily."
            : "Try to nudge your savings rate toward 20% by automating transfers on payday.",
        tone: "success",
      });
    }

    const ent = expenses.filter((e) => e.category === "Entertainment").reduce((s, e) => s + e.amount, 0);
    if (ent > 0) {
      items.push({
        title: `Entertainment totals ৳${ent.toLocaleString()}`,
        desc: `You could save approximately ৳${Math.round(ent * 0.3 / 100) * 100} this month by reducing entertainment spend by 30%.`,
        tone: "info",
      });
    }

    return items;
  }, [expenses, stats]);

  const visibleInsights = insights.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Deep insights into your finances</p>
        </div>
        <Badge variant="info" className="gap-1.5 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Claude AI
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Highest category"
          value={stats.highest?.category ?? "—"}
          sub={stats.highest ? `৳${stats.highest.total.toLocaleString()} this period` : undefined}
          icon={Flame}
          delay={0.02}
        />
        <StatCard
          label="Average daily expense"
          value={`৳${Math.round(stats.avgDaily).toLocaleString()}`}
          sub="Last 30 days"
          icon={CalendarClock}
          delay={0.06}
        />
        <StatCard
          label="Biggest transaction"
          value={`৳${stats.biggest.amount.toLocaleString()}`}
          sub={stats.biggest.title}
          icon={Target}
          delay={0.1}
        />
        <StatCard
          label="Monthly growth"
          value={`${stats.growth >= 0 ? "+" : ""}${stats.growth.toFixed(1)}%`}
          sub="vs previous month"
          icon={Award}
          trend={stats.growth}
          delay={0.14}
        />
        <StatCard
          label="Savings rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          sub="of income saved"
          icon={PiggyBank}
          delay={0.18}
        />
        <StatCard
          label="Lowest category"
          value={stats.lowest?.category ?? "—"}
          sub={stats.lowest ? `৳${stats.lowest.total.toLocaleString()} this period` : undefined}
          icon={PiggyBank}
          delay={0.22}
        />
      </div>

      <Card className="border-[var(--primary)]/20 bg-[linear-gradient(135deg,var(--primary)/8,var(--accent)/8)]">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white">
              <Brain className="h-4.5 w-4.5" />
            </span>
            <div>
              <CardTitle>AI Insights</CardTitle>
              <p className="text-xs text-[var(--muted-foreground)]">Generated from your real data</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInsightKey((k) => k + 1)}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </Button>
        </CardHeader>
        <CardContent>
          <div key={insightKey} className="grid gap-3 md:grid-cols-2">
            {visibleInsights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "rounded-2xl border p-4",
                  ins.tone === "warning" && "border-amber-500/25 bg-amber-500/8",
                  ins.tone === "success" && "border-emerald-500/25 bg-emerald-500/8",
                  ins.tone === "info" && "border-sky-500/25 bg-sky-500/8"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    ins.tone === "warning" && "text-amber-600 dark:text-amber-400",
                    ins.tone === "success" && "text-emerald-600 dark:text-emerald-400",
                    ins.tone === "info" && "text-sky-600 dark:text-sky-400"
                  )}
                >
                  {ins.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{ins.desc}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ChartCard title="Spending trend" subtitle="Daily · weekly · monthly views">
        <Tabs
          defaultValue="week"
          tabs={[
            { value: "week", label: "Daily" },
            { value: "month", label: "Weekly" },
            { value: "year", label: "Monthly" },
          ]}
          onValueChange={setRange}
        >
          {() => <div className="mt-4"><TrendAreaChart data={rangeData} height={300} /></div>}
        </Tabs>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Income vs expense" subtitle="Last 8 months">
          <IncomeExpenseBar data={ivsData} height={280} />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Category breakdown</CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">All-time allocation</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
              <CategoryPie data={catData.map((c) => ({ category: c.category, total: c.total }))} height={240} />
              <div className="space-y-2">
                {catData.map((c) => (
                  <div key={c.category} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{c.category}</span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {((c.total / Math.max(1, stats.total)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
