"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_COLORS } from "@/types";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "var(--foreground)",
  boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.2)",
};

function axisProps() {
  return {
    stroke: "var(--muted-foreground)",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
  };
}

export function TrendAreaChart({
  data,
  height = 260,
}: {
  data: { label?: string; date?: string; total: number }[];
  height?: number;
}) {
  const formatted = data.map((d) => ({
    ...d,
    label:
      d.label ??
      new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps()} tickMargin={8} minTickGap={24} />
        <YAxis {...axisProps()} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} width={40} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`৳${Number(v).toLocaleString()}`, "Spent"]}
          labelStyle={{ color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#spend)"
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseBar({
  data,
  height = 260,
}: {
  data: { label: string; income: number; expense: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" {...axisProps()} tickMargin={8} minTickGap={24} />
        <YAxis {...axisProps()} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} width={40} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => [`৳${Number(v).toLocaleString()}`, name === "income" ? "Income" : "Expense"]}
          labelStyle={{ color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 4 }}
          cursor={{ fill: "var(--muted)", opacity: 0.3 }}
        />
        <Bar dataKey="income" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={22} />
        <Bar dataKey="expense" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({
  data,
  height = 240,
}: {
  data: { category: string; total: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          innerRadius="62%"
          outerRadius="88%"
          paddingAngle={3}
          cornerRadius={6}
          stroke="none"
        >
          {data.map((d) => (
            <Cell
              key={d.category}
              fill={CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS] ?? "#78716c"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => [`৳${Number(v).toLocaleString()}`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
