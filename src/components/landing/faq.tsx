"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/animated-background";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is ExpenseFlow AI really free to start?",
    a: "Yes. The Free plan includes 100 expenses per month, a single budget, and unlimited bill reminders — no credit card required. Upgrade to Pro whenever you need more.",
  },
  {
    q: "Which payment methods are supported in Bangladesh?",
    a: "We support bKash, Nagad, Rocket, credit/debit cards via SSLCommerz, and PayPal internationally. All transactions are processed over encrypted connections.",
  },
  {
    q: "How does the receipt scanner work?",
    a: "Snap or upload a photo of your receipt and our AI extracts the store name, date, total amount, and line items — then pre-fills the expense form for you to review.",
  },
  {
    q: "Can I use ExpenseFlow with my family or team?",
    a: "Absolutely. The Business plan supports team workspaces with shared budgets, shared wallets, member invitations, and granular permission controls.",
  },
  {
    q: "Is my financial data secure?",
    a: "Yes. Data is encrypted in transit and at rest, authentication is handled with industry-standard protocols, and you can export or delete your data at any time.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Of course. Cancel in one click from your settings — no calls, no forms, no friction. Your data stays intact and you keep full access until the end of your billing period.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-12 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
              FAQ
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Questions? <span className="text-gradient">Answered.</span>
            </h2>
          </FadeIn>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <FadeIn key={f.q} delay={i * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold sm:text-base">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[var(--muted-foreground)] transition-transform duration-300",
                      open === i && "rotate-180 text-[var(--primary)]"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
