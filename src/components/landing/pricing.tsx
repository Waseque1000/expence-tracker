"use client";

import { Check } from "lucide-react";
import { FadeIn } from "@/components/animated-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "৳0",
    period: "forever",
    desc: "For getting started with personal tracking.",
    features: [
      "100 expenses per month",
      "Basic reports",
      "1 budget",
      "Unlimited bills",
      "Community support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "৳499",
    period: "/month",
    desc: "For serious savers who want full control.",
    features: [
      "Unlimited expenses",
      "Advanced analytics & charts",
      "AI-powered insights",
      "Receipt scanner (OCR)",
      "Export reports (PDF, Excel, CSV)",
      "Priority support",
    ],
    cta: "Get Pro",
    featured: true,
  },
  {
    name: "Business",
    price: "৳1,999",
    period: "/month",
    desc: "For teams and families who share finances.",
    features: [
      "Everything in Pro",
      "Team workspace",
      "Shared budgets & wallets",
      "Member permissions",
      "API access",
      "Advanced analytics",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-12 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
              Pricing
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Simple pricing, <span className="text-gradient">serious value</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Start free. Upgrade when you are ready. Cancel anytime.
            </p>
          </FadeIn>
        </div>

        <div className="mx-auto mt-10 sm:mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.1} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1",
                  p.featured
                    ? "border-transparent bg-[linear-gradient(135deg,var(--primary),var(--accent))] p-px"
                    : "border-[var(--border)] bg-[var(--card)] card-shadow hover:card-shadow-hover"
                )}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <Badge className="bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-white">
                      Most popular
                    </Badge>
                  </div>
                )}
                <div
                  className={cn(
                    "flex h-full flex-col rounded-[calc(1.5rem-1px)] p-6",
                    p.featured && "bg-[var(--card)]"
                  )}
                >
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{p.period}</span>
                  </div>
                  <ul className="mt-6 flex flex-1 flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/12">
                          <Check className="h-3 w-3 text-[var(--primary)]" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="mt-7">
                    <Button
                      variant={p.featured ? "gradient" : "outline"}
                      className="w-full h-12 text-base"
                    >
                      {p.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Pay with credit card, bKash, Nagad, or SSLCommerz. 30-day money-back guarantee.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
