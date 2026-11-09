export type Category =
  | "House Rent"
  | "Fixed Bazar"
  | "Utilities Bill"
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Medical"
  | "Education"
  | "Entertainment"
  | "Family & Care"
  | "EMI & Loans"
  | "Investment"
  | "Travel"
  | "Charity & Gifts"
  | "Maintenance"
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
  "House Rent",
  "Fixed Bazar",
  "Utilities Bill",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Medical",
  "Education",
  "Entertainment",
  "Family & Care",
  "EMI & Loans",
  "Investment",
  "Travel",
  "Charity & Gifts",
  "Maintenance",
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
  "House Rent": "#0284c7",
  "Fixed Bazar": "#16a34a",
  "Utilities Bill": "#f59e0b",
  Food: "#ea580c",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#8b5cf6",
  Medical: "#ef4444",
  Education: "#6366f1",
  Entertainment: "#14b8a6",
  "Family & Care": "#f43f5e",
  "EMI & Loans": "#dc2626",
  Investment: "#10b981",
  Travel: "#06b6d4",
  "Charity & Gifts": "#84cc16",
  Maintenance: "#78716c",
  Others: "#64748b",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  "House Rent": "Home",
  "Fixed Bazar": "ShoppingBag",
  "Utilities Bill": "Zap",
  Food: "Utensils",
  Transport: "Car",
  Shopping: "ShoppingCart",
  Bills: "Receipt",
  Medical: "HeartPulse",
  Education: "GraduationCap",
  Entertainment: "Clapperboard",
  "Family & Care": "Sparkles",
  "EMI & Loans": "CreditCard",
  Investment: "TrendingUp",
  Travel: "Plane",
  "Charity & Gifts": "Gift",
  Maintenance: "Wrench",
  Others: "MoreHorizontal",
};
