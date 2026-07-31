"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeIn, AuroraBackground } from "@/components/animated-background";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <AuroraBackground className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] px-6 py-16 text-center sm:py-24">
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
                Take control of your money{" "}
                <span className="text-gradient">starting today</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted-foreground)]">
                Join thousands who trust ExpenseFlow AI to track, plan, and grow
                their finances. Free forever plan — no card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                    Create your free account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View live demo
                  </Button>
                </Link>
              </div>
            </div>
          </AuroraBackground>
        </FadeIn>
      </div>
    </section>
  );
}
