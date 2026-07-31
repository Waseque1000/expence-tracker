import type { Category, Expense, Income } from "@/types";
import { lastNDays, monthKey } from "@/lib/format";

export function dailyTotals(expenses: Expense[], days = 14) {
  const daysArr = lastNDays(days);
  const map = new Map(daysArr.map((d) => [d, 0]));
  expenses.forEach((e) => {
    if (map.has(e.date)) map.set(e.date, (map.get(e.date) ?? 0) + e.amount);
  });
  return daysArr.map((d) => ({ date: d, total: map.get(d) ?? 0 }));
}

export function weeklyTotals(expenses: Expense[]) {
  const buckets: { label: string; total: number }[] = [];
  const now = new Date();
  for (let w = 0; w < 8; w++) {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() - w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const total = expenses
      .filter((e) => {
        const d = new Date(e.date + "T00:00:00");
        return d >= start && d <= end;
      })
      .reduce((s, e) => s + e.amount, 0);
    buckets.unshift({
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total,
    });
  }
  return buckets;
}

export function monthlyTotals(expenses: Expense[], months = 12) {
  const buckets: { label: string; total: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const total = expenses.filter((e) => monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);
    buckets.push({ label: d.toLocaleDateString("en-US", { month: "short" }), total });
  }
  return buckets;
}

export function categoryBreakdown(expenses: Expense[]) {
  const map = new Map<Category, number>();
  expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function incomeVsExpense(income: Income[], expenses: Expense[], months = 6) {
  const buckets: { label: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const exp = expenses.filter((e) => monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);
    const inc = income.filter((i) => monthKey(i.date) === key).reduce((s, x) => s + x.amount, 0);
    buckets.push({ label: d.toLocaleDateString("en-US", { month: "short" }), income: inc, expense: exp });
  }
  return buckets;
}

export function getStats(expenses: Expense[], income: Income[]) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const byCategory = categoryBreakdown(expenses);
  const highest = byCategory[0];
  const lowest = byCategory[byCategory.length - 1];
  const days = lastNDays(30);
  const thisMonthExpenses = expenses.filter((e) => monthKey(e.date) === monthKey(new Date()));
  const lastMonthKey = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const lastMonthExpenses = expenses.filter((e) => monthKey(e.date) === lastMonthKey);
  const avgDaily = total / Math.max(1, days.length);
  const biggest = expenses.reduce((m, e) => (e.amount > m.amount ? e : m), {
    title: "—",
    amount: 0,
  } as Pick<Expense, "title" | "amount">);

  const cur = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const prev = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const growth = prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100;

  const savingsRate = totalIncome > 0 ? ((totalIncome - total) / totalIncome) * 100 : 0;

  return {
    total,
    totalIncome,
    avgDaily,
    biggest,
    highest,
    lowest,
    growth,
    savingsRate,
    thisMonthExpenses: cur,
    lastMonthExpenses: prev,
  };
}
