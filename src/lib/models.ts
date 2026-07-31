import mongoose, { Schema, models } from "mongoose";
import type {
  Bill,
  Budget,
  Expense,
  Goal,
  Income,
  UserSettings,
} from "@/types";

const ExpenseSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    notes: String,
    receipt: String,
    tags: { type: [String], default: [] },
    recurring: { type: Schema.Types.Mixed },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const IncomeSchema = new Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    notes: String,
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const BudgetSchema = new Schema(
  {
    id: { type: String, required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    month: { type: String, required: true },
  },
  { _id: false }
);

const BillSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    frequency: { type: String, required: true },
    paid: { type: Boolean, default: false },
    paidDate: String,
    provider: String,
  },
  { _id: false }
);

const GoalSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
    deadline: String,
    color: { type: String, required: true },
  },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    name: String,
    email: String,
    currency: { type: String, default: "BDT" },
    theme: { type: String, default: "dark" },
    timezone: { type: String, default: "Asia/Dhaka" },
    language: { type: String, default: "English" },
    monthlyIncome: { type: Number, default: 0 },
  },
  { _id: false }
);

const LedgerSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    expenses: { type: [ExpenseSchema], default: [] },
    income: { type: [IncomeSchema], default: [] },
    budgets: { type: [BudgetSchema], default: [] },
    bills: { type: [BillSchema], default: [] },
    goals: { type: [GoalSchema], default: [] },
    settings: { type: SettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type LedgerData = {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
  bills: Bill[];
  goals: Goal[];
  settings: UserSettings;
};

export const Ledger =
  (models.Ledger as mongoose.Model<LedgerData> | undefined) ??
  mongoose.model<LedgerData>("Ledger", LedgerSchema);
