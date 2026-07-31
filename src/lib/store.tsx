"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Bill, Budget, Expense, Goal, Income, UserSettings } from "@/types";
import { uid } from "@/lib/utils";
import { monthKey, todayISO } from "@/lib/format";
import { useAuth } from "@/lib/auth";

type Store = {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
  bills: Bill[];
  goals: Goal[];
  settings: UserSettings;
};

type StoreContextValue = Store & {
  loading: boolean;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;
  addIncome: (i: Omit<Income, "id" | "createdAt">) => void;
  updateIncome: (id: string, patch: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  deleteBudget: (id: string) => void;
  addBill: (b: Omit<Bill, "id">) => void;
  toggleBillPaid: (id: string) => void;
  deleteBill: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  addToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
};

const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  email: "",
  currency: "BDT",
  theme: "dark",
  timezone: "Asia/Dhaka",
  language: "English",
  monthlyIncome: 0,
};

const EMPTY_STORE: Store = {
  expenses: [],
  income: [],
  budgets: [],
  bills: [],
  goals: [],
  settings: DEFAULT_SETTINGS,
};

const StoreContext = createContext<StoreContextValue | null>(null);

type FetchedData = Partial<Store> & { settings?: Partial<UserSettings> };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const displayName = user?.displayName;
  const email = user?.email;
  const [state, setState] = useState<Store>(EMPTY_STORE);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const loading = userId !== loadedFor;

  if (!userId && loadedFor !== null) {
    setState(EMPTY_STORE);
    setLoadedFor(null);
  }

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    fetch(`/api/data?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        const data = (res?.data ?? {}) as FetchedData;
        const dbSettings: Partial<UserSettings> = data.settings ?? {};
        setState({
          expenses: data.expenses ?? [],
          income: data.income ?? [],
          budgets: data.budgets ?? [],
          bills: data.bills ?? [],
          goals: data.goals ?? [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...dbSettings,
            name: dbSettings.name || displayName || "",
            email: dbSettings.email || email || "",
          },
        });
      })
      .catch(() => {
        if (!cancelled) setState(EMPTY_STORE);
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, displayName, email]);

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || userId !== loadedFor) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, data: state }),
      }).catch(() => {
        /* keep local state; retry on next change */
      });
    }, 400);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [state, userId, loadedFor]);

  const addExpense = useCallback((e: Omit<Expense, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      expenses: [{ ...e, id: uid(), createdAt: new Date().toISOString() }, ...s.expenses],
    }));
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setState((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  }, []);

  const duplicateExpense = useCallback((id: string) => {
    setState((s) => {
      const src = s.expenses.find((e) => e.id === id);
      if (!src) return s;
      return {
        ...s,
        expenses: [{ ...src, id: uid(), createdAt: new Date().toISOString() }, ...s.expenses],
      };
    });
  }, []);

  const addIncome = useCallback((i: Omit<Income, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      income: [{ ...i, id: uid(), createdAt: new Date().toISOString() }, ...s.income],
    }));
  }, []);

  const updateIncome = useCallback((id: string, patch: Partial<Income>) => {
    setState((s) => ({ ...s, income: s.income.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setState((s) => ({ ...s, income: s.income.filter((i) => i.id !== id) }));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, "id">) => {
    setState((s) => ({
      ...s,
      budgets: [
        ...s.budgets.filter((x) => !(x.category === b.category && x.month === b.month)),
        { ...b, id: uid() },
      ],
    }));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setState((s) => ({ ...s, budgets: s.budgets.filter((b) => b.id !== id) }));
  }, []);

  const addBill = useCallback((b: Omit<Bill, "id">) => {
    setState((s) => ({ ...s, bills: [{ ...b, id: uid() }, ...s.bills] }));
  }, []);

  const toggleBillPaid = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      bills: s.bills.map((b) =>
        b.id === id
          ? { ...b, paid: !b.paid, paidDate: !b.paid ? todayISO() : undefined }
          : b
      ),
    }));
  }, []);

  const deleteBill = useCallback((id: string) => {
    setState((s) => ({ ...s, bills: s.bills.filter((b) => b.id !== id) }));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, "id">) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }] }));
  }, []);

  const addToGoal = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      duplicateExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addBudget,
      deleteBudget,
      addBill,
      toggleBillPaid,
      deleteBill,
      addGoal,
      addToGoal,
      deleteGoal,
      updateSettings,
    }),
    [
      state,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      duplicateExpense,
      addIncome,
      updateIncome,
      deleteIncome,
      addBudget,
      deleteBudget,
      addBill,
      toggleBillPaid,
      deleteBill,
      addGoal,
      addToGoal,
      deleteGoal,
      updateSettings,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useExpenseTotals() {
  const { expenses, income, budgets, settings } = useStore();
  const currency = settings.currency;

  const monthlyExpenses = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === monthKey(new Date()))
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const monthlyIncome = useMemo(
    () =>
      income
        .filter((i) => monthKey(i.date) === monthKey(new Date()))
        .reduce((sum, i) => sum + i.amount, 0),
    [income]
  );
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalIncome = useMemo(() => income.reduce((s, i) => s + i.amount, 0), [income]);
  const totalBudget = useMemo(
    () => budgets.filter((b) => b.month === monthKey(new Date())).reduce((s, b) => s + b.limit, 0),
    [budgets]
  );
  const remainingBudget = totalBudget - monthlyExpenses;
  const savings = totalIncome - totalExpenses;

  return { monthlyExpenses, monthlyIncome, totalExpenses, totalIncome, totalBudget, remainingBudget, savings, currency };
}
