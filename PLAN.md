# ExpenseFlow AI – Implementation Plan

## 1. Overview
Production-ready SaaS expense tracker (Linear/Vercel/Stripe-grade UI) built with Next.js App Router, React 19, and Tailwind CSS. Features: expense/income tracking, budgets, recurring bills, analytics, AI insights, receipt scanner, reports, savings goals, team workspace, subscriptions, and admin panel.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI | shadcn-style primitives (custom), Framer Motion, Recharts, Lucide |
| Forms/Validation | React Hook Form + Zod |
| Backend | Server Components + Server Actions + API Routes |
| DB | MongoDB + Mongoose |
| Auth | NextAuth (Google + Email/Credentials) |
| Uploads | Cloudinary (receipts) |
| Payments | Stripe + SSLCommerz |
| AI | Claude (insights + receipt OCR via vision) |
| Email | Resend / Nodemailer |
| Scheduling | Vercel Cron |

## 3. Current State (shipped)

A complete, working **local-first** product. All data persists to `localStorage` through a typed store (`src/lib/store.tsx`) that mirrors the future MongoDB schema, so every feature works end-to-end today and swaps cleanly to a real backend.

### Routes
- `/` — landing page (hero, animated background, features, pricing, testimonials, FAQ, CTA, footer)
- `/login`, `/register`, `/forgot-password` — auth screens (UI + validation, mock Google OAuth)
- `/dashboard` — overview (stat cards, charts, budget health, recent transactions, upcoming bills)
- `/dashboard/expenses` — CRUD, duplicate, receipt scan (simulated), tags, search + filters
- `/dashboard/income` — income sources, net balance
- `/dashboard/budgets` — animated progress bars, over-budget alerts
- `/dashboard/bills` — reminders (3d/1d/today badges), recurring frequency
- `/dashboard/analytics` — charts, stats, AI insights (generated from real data)
- `/dashboard/goals` — savings goals with contributions
- `/dashboard/reports` — daily/weekly/monthly/yearly/custom + CSV/Excel/PDF export
- `/dashboard/settings` — profile, currency, theme, timezone, language, reset

### Design system
- Dark/light mode with `@theme` tokens and class-based `.dark` variant
- Glassmorphism (`glass`, `glass-strong`), soft shadows, gradients, motion primitives
- Skeleton loading, empty states, error toasts, responsive mobile-first layout

## 4. Folder Structure

```
src/
  app/                # routes (landing, auth, dashboard, api)
  components/
    ui/               # button, card, input, select, modal, progress, toast, ...
    auth/             # google button
    landing/          # navbar, hero, features, pricing, testimonials, faq, cta, footer
    dashboard/        # shell, sidebar, header, stat-card, charts, expense-form, ...
  lib/                # store (data layer), analytics, format, theme, utils
  types/              # domain types & constants
```

## 5. Roadmap

### Phase 1 – Real backend
- MongoDB + Mongoose models (User, Expense, Income, Budget, Bill, Goal, Notification, Receipt, Team, Subscription, Payment)
- NextAuth with Google + email login, email verification, forgot password
- Server Actions replacing the localStorage store; seed script

### Phase 2 – Automation
- Vercel Cron: recurring expense generation + bill reminders (email via Resend)
- Notification center wired to real events (budget exceeded, bills due, goal complete)

### Phase 3 – AI
- Claude integration: real receipt OCR (Cloudinary upload + vision) → auto-fill expense form
- Real AI insights endpoint with monthly comparisons and saving suggestions

### Phase 4 – Monetization & collaboration
- Stripe + SSLCommerz checkout, usage limits per plan (Free/Pro/Business)
- Team workspace (invites, shared budgets, permissions)
- Admin panel (users, analytics, subscriptions, revenue, plans, feature flags)

## 6. Conventions
- Server-first; lean client components where interactivity is needed
- Every list/form has loading, empty, and error states
- Central currency/date formatters in `src/lib/format.ts`
- Secrets only in `.env.local`; never committed

## 7. Decisions
- AI provider: **Claude** (insights + OCR)
- Scheduling: **Vercel Cron** (serverless)
- Email: Resend (default)
- Auth strategy: JWT for this scope
