import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";
import { AuthGuard } from "@/components/dashboard/auth-guard";

export const metadata: Metadata = {
  title: {
    default: "Dashboard – ExpenseFlow AI",
    template: "%s – ExpenseFlow AI",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
