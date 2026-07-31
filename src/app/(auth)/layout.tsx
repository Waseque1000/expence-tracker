import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { AuroraBackground } from "@/components/animated-background";
import { Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication – ExpenseFlow AI",
};

const POINTS = [
  { icon: Sparkles, text: "AI insights that reveal your spending patterns" },
  { icon: TrendingUp, text: "Hit savings goals faster with smart budgets" },
  { icon: ShieldCheck, text: "Bank-grade encryption for your financial data" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 lg:block">
        <AuroraBackground className="h-full">
          <div className="flex h-full flex-col justify-between p-12">
            <Link href="/">
              <Logo />
            </Link>
            <div>
              <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
                Your money, finally <span className="text-gradient">under control</span>
              </h2>
              <ul className="mt-8 space-y-4">
                {POINTS.map((p) => (
                  <li key={p.text} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12">
                      <p.icon className="h-4.5 w-4.5 text-[var(--primary)]" />
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Trusted by 10,000+ people in Bangladesh & beyond
            </p>
          </div>
        </AuroraBackground>
      </div>
      <div className="relative flex w-full items-center justify-center overflow-hidden px-4 py-10 lg:max-w-xl">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_55%)]" />
        </div>
        {children}
      </div>
    </div>
  );
}
