import { DashboardShell } from "@/components/dashboard/shell";
import { FinancialOverview } from "@/components/dashboard/financial-overview";

export default function Home() {
  return (
    <DashboardShell>
      <FinancialOverview />
    </DashboardShell>
  );
}
