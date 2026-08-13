"use client";

import { Home, Layers, CreditCard, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "#", icon: Home },
  { label: "Features", href: "#features", icon: Layers },
  { label: "Pricing", href: "#pricing", icon: CreditCard },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
];

export function MobileBottomNav() {
  const [active, setActive] = useState("Home");
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false); // Scroll down, hide nav
      } else {
        setVisible(true); // Scroll up, show nav
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 md:hidden glass-strong border-t border-[var(--border)] pb-safe"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActive(item.label)}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 transition-colors relative",
                isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-0 -top-[1px] h-0.5 bg-[var(--primary)]"
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
