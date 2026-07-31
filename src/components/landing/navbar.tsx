"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong card-shadow" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-sm">
              Log in
            </Button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <Button variant="gradient" size="sm" className="h-9">
              Get started free
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] md:hidden cursor-pointer"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-strong overflow-hidden border-t border-[var(--border)] md:hidden"
        >
          <div className="flex flex-col gap-1 p-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[var(--muted)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button variant="gradient" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
