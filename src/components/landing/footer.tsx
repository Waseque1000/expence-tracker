import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact", "Press kit"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Community", "Status", "Support"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookies", "GDPR"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
              The premium expense tracker for individuals, families, and teams.
              Track, budget, and grow with AI-powered clarity.
            </p>
            <div className="mt-5 flex gap-2">
              {["X", "LinkedIn", "GitHub", "YouTube"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} ExpenseFlow AI. All rights reserved.
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link
              href="https://wasee-one.vercel.app/"
              className="ml-1 text-[var(--foreground)] hover:underline"
            >
              Waseque Arafat 🇧🇩
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
