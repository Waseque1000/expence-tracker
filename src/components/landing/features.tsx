"use client";

import {
  BarChart3,
  BellRing,
  Camera,
  FileText,
  PiggyBank,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { FadeIn } from "@/components/animated-background";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Receipt,
    title: "Effortless expense tracking",
    desc: "Log expenses in seconds with smart categories, tags, payment methods, and receipt uploads.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: PiggyBank,
    title: "Budget & goals",
    desc: "Set monthly budgets per category and watch animated progress bars keep you on track.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Beautiful analytics",
    desc: "Spending trends, category breakdowns, and income vs expense — all in stunning charts.",
    color: "from-sky-500 to-cyan-600",
  },
  {
    icon: Zap,
    title: "AI-powered insights",
    desc: "Get intelligent analysis of your spending habits with practical saving suggestions.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Camera,
    title: "Receipt scanner",
    desc: "Snap a receipt and let AI extract the store, date, amount, and items automatically.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: BellRing,
    title: "Bill reminders",
    desc: "Never miss a payment. Get reminders 3 days, 1 day, and on the day bills are due.",
    color: "from-indigo-500 to-blue-600",
  },
  {
    icon: RefreshCw,
    title: "Recurring expenses",
    desc: "Automate daily, weekly, monthly, and yearly expenses so nothing slips through.",
    color: "from-teal-500 to-emerald-600",
  },
  {
    icon: FileText,
    title: "Rich reports",
    desc: "Generate daily, weekly, monthly, or custom reports and export to PDF, Excel, or CSV.",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: Users,
    title: "Team workspace",
    desc: "Share budgets and expenses with family or team members with granular permissions.",
    color: "from-cyan-500 to-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    desc: "Secure authentication, encrypted data, and role-based access control by default.",
    color: "from-lime-500 to-green-600",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-12 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
              Features
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Everything you need to{" "}
              <span className="text-gradient">master your money</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              A complete financial toolkit designed to feel effortless and beautiful.
            </p>
          </FadeIn>
        </div>

        <div className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06} className="h-full">
              <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow-hover">
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                    f.color
                  )}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
