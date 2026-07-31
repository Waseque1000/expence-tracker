import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseFlow AI – Smart Expense Tracker",
  description:
    "Track expenses, plan budgets, and unlock AI-powered insights. A premium SaaS expense tracker for individuals, families, and businesses.",
  keywords: [
    "expense tracker",
    "budget planner",
    "personal finance",
    "AI insights",
    "SaaS finance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
