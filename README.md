# ExpenseFlow AI

A premium, production-ready SaaS expense tracker with a Linear/Vercel/Stripe-grade UI. Track expenses, plan budgets, scan receipts, and unlock AI-powered insights — built with Next.js, React 19, TypeScript, and Tailwind CSS.

## ✨ Features

- **Dashboard** — today/week/month/total expenses, current balance, remaining budget, savings
- **Expense management** — CRUD, duplicate, notes, tags, receipts, 10 categories, 8 payment methods (Cash, Bank, bKash, Nagad, Rocket, PayPal…)
- **Income tracker** — salary, freelancing, business, bonus, investment, other
- **Budget planner** — animated progress bars, over-budget alerts and warning badges
- **Bill reminders** — 3 days / 1 day / due-today states, recurring frequency
- **Analytics** — spending trends, category pie, income vs expense, 6 key statistics
- **AI insights** — generated from your real data (swap in Claude for live generation)
- **Receipt scanner** — simulated AI scan that auto-fills the expense form
- **Savings goals** — targets with contributions and progress
- **Reports** — daily/weekly/monthly/yearly/custom with CSV, Excel, and PDF export
- **Settings** — profile, currency, theme, timezone, language
- **Dark & light mode**, glassmorphism, skeleton loading, empty states, responsive mobile-first layout

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app ships with realistic demo data and persists everything to `localStorage` — no setup required.

> Log in via `/login` (pre-filled demo credentials) or create an account at `/register`.

## 🧱 Tech stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · React Hook Form + Zod · Lucide

## 📁 Structure

```
src/app            # routes: /, /login, /register, /forgot-password, /dashboard/*
src/components     # ui primitives, landing sections, dashboard widgets
src/lib            # data store, analytics, formatting, theme
src/types          # domain types & constants
```

## 🗺️ Roadmap

MongoDB + Mongoose, NextAuth (Google + email), Cloudinary uploads, Claude OCR + insights, Stripe + SSLCommerz billing, team workspace, and an admin panel. See [PLAN.md](./PLAN.md) for the full plan.

## 🧑‍💻 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
