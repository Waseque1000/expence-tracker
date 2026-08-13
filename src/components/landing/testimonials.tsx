"use client";

import { Star } from "lucide-react";
import { FadeIn } from "@/components/animated-background";
import { Avatar } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Nusrat Jahan",
    role: "Freelance Designer",
    quote:
      "I finally understand where my money goes. The AI insights caught a subscription I'd been paying for 8 months without noticing.",
    initials: "NJ",
  },
  {
    name: "Rafiq Hasan",
    role: "Startup Founder",
    quote:
      "The cleanest finance tool I've ever used. My whole team tracks expenses in a shared workspace and reports export in one click.",
    initials: "RH",
  },
  {
    name: "Sadia Islam",
    role: "Product Manager",
    quote:
      "Budget alerts saved me from overspending on shopping twice this month. The bKash integration makes logging effortless.",
    initials: "SI",
  },
  {
    name: "Tanvir Ahmed",
    role: "Software Engineer",
    quote:
      "Beautiful, fast, and the receipt scanner is genuinely magic. It fills in everything automatically from a photo.",
    initials: "TA",
  },
  {
    name: "Farhana Akter",
    role: "Teacher",
    quote:
      "We use it as a family to plan the household budget. The shared wallets keep everyone accountable and kind.",
    initials: "FA",
  },
  {
    name: "Mushfiq Rahman",
    role: "Content Creator",
    quote:
      "The savings goal tracker got me to my MacBook fund three months early. This app changed how I think about money.",
    initials: "MR",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-12 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
              Testimonials
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Loved by <span className="text-gradient">thousands</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Join people across Bangladesh and beyond who master their money daily.
            </p>
          </FadeIn>
        </div>

        <div className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.06} className="h-full">
              <figure className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow transition-all duration-300 hover:-translate-y-1 hover:card-shadow-hover">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
