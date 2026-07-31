export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Medical"
  | "Entertainment"
  | "Travel"
  | "Education"
  | "Investment"
  | "Others";

export type PaymentMethod =
  | "Cash"
  | "Bank"
  | "Credit Card"
  | "Debit Card"
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "PayPal";

export type IncomeSource =
  | "Salary"
  | "Freelancing"
  | "Business"
  | "Bonus"
  | "Investment"
  | "Other Income";

export type BillFrequency = "Once" | "Monthly" | "Quarterly" | "Yearly";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // ISO yyyy-MM-dd
  paymentMethod: PaymentMethod;
  notes?: string;
  receipt?: string; // Cloudinary URL
  tags: string[];
  recurring?: Recurrence;
  createdAt: string;
};

export type Recurrence = {
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  endDate?: string;
};

export type Income = {
  id: string;
  source: IncomeSource;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
};

export type Budget = {
  id: string;
  category: Category;
  limit: number;
  month: string; // yyyy-MM
};

export type Bill = {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // ISO yyyy-MM-dd
  frequency: BillFrequency;
  paid: boolean;
  paidDate?: string;
  provider?: string;
};

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline?: string;
  color: string;
};

export type UserSettings = {
  name: string;
  email: string;
  currency: "BDT" | "USD" | "EUR" | "INR";
  theme: "light" | "dark";
  timezone: string;
  language: string;
  monthlyIncome: number;
};

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Medical",
  "Entertainment",
  "Travel",
  "Education",
  "Investment",
  "Others",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Bank",
  "Credit Card",
  "Debit Card",
  "bKash",
  "Nagad",
  "Rocket",
  "PayPal",
];

export const INCOME_SOURCES: IncomeSource[] = [
  "Salary",
  "Freelancing",
  "Business",
  "Bonus",
  "Investment",
  "Other Income",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#8b5cf6",
  Medical: "#ef4444",
  Entertainment: "#14b8a6",
  Travel: "#06b6d4",
  Education: "#6366f1",
  Investment: "#10b981",
  Others: "#78716c",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "Utensils",
  Transport: "Car",
  Shopping: "ShoppingBag",
  Bills: "Receipt",
  Medical: "HeartPulse",
  Entertainment: "Clapperboard",
  Travel: "Plane",
  Education: "GraduationCap",
  Investment: "TrendingUp",
  Others: "MoreHorizontal",
};
