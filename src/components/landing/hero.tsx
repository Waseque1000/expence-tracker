"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animated-background";

const STATS = [
  { label: "Today", value: "৳4,050", delta: -2.4, trend: "down" },
  { label: "Week", value: "৳12,300", delta: +8.1, trend: "up" },
  { label: "Month", value: "৳48,920", delta: +3.6, trend: "up" },
];

const BARS = [34, 48, 30, 58, 44, 62, 38, 70, 52, 82, 64, 90];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              Now with AI-powered insights
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Every taka, <br className="hidden sm:block" />
              <span className="text-gradient">beautifully</span> accounted for
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted-foreground)]">
              ExpenseFlow AI turns your spending into crystal-clear insights. Track
              expenses, plan budgets, scan receipts, and hit your savings goals —
              all in one premium workspace.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  Start free — no card needed
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Live demo
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1.5">
                <CheckDot /> Free plan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckDot /> 100+ expense categories
              </span>
              <span className="flex items-center gap-1.5">
                <CheckDot /> bKash, Nagad & more
              </span>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.5} y={48} className="relative mt-16 sm:mt-20">
          <DashboardPreview />
        </FadeIn>
      </div>
    </section>
  );
}

function CheckDot() {
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/15">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </span>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[linear-gradient(135deg,var(--primary),var(--accent))] opacity-[0.12] blur-3xl" />
      <div className="glass-strong card-shadow-hover overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            app.expenseflow.ai/dashboard
          </span>
          <Wallet className="h-4 w-4 text-[var(--primary)]" />
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 sm:gap-3 sm:p-5">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted-foreground)] sm:text-xs">{s.label}</span>
                {s.trend === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-400 sm:h-4 sm:w-4" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" />
                )}
              </div>
              <p className="mt-1.5 truncate text-sm font-bold sm:text-xl">{s.value}</p>
              <p
                className={`mt-0.5 hidden text-xs font-medium sm:block ${
                  s.trend === "up"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-emerald-500 dark:text-emerald-400"
                }`}
              >
                {s.delta > 0 ? "+" : ""}
                {s.delta}% vs last period
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 p-5 pt-0 sm:grid-cols-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 sm:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Spending trend</p>
                <p className="text-xs text-[var(--muted-foreground)]">Last 12 months</p>
              </div>
              <Badge variant="info" className="gap-1">
                <TrendingUp className="h-3 w-3" /> +3.6%
              </Badge>
            </div>
            <div className="flex h-28 items-end gap-1.5">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.9 + i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-md bg-[linear-gradient(180deg,var(--accent),var(--primary))] opacity-80"
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 sm:col-span-2">
            <p className="mb-3 text-sm font-semibold">Budget health</p>
            {[
              { label: "Food", pct: 82, color: "from-amber-400 to-orange-500" },
              { label: "Shopping", pct: 64, color: "from-pink-400 to-rose-500" },
              { label: "Bills", pct: 45, color: "from-violet-400 to-purple-500" },
            ].map((b, i) => (
              <div key={b.label} className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{b.label}</span>
                  <span className="text-[var(--muted-foreground)]">{b.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ delay: 1.2 + i * 0.15, duration: 0.7 }}
                    className={`h-full rounded-full bg-gradient-to-r ${b.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: "spring", damping: 18 }}
        className="glass-strong absolute -right-4 -top-6 hidden rounded-2xl p-4 card-shadow-hover lg:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold">AI Insight</p>
            <p className="text-xs text-[var(--muted-foreground)]">Food up 28% this month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
