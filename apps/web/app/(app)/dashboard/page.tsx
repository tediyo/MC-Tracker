import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const referenceDate = new Date();
  const initialData = await getDashboardData(supabase, user.id, "monthly", referenceDate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your real-time financial metrics, cash flow trends, and budget targets.
          </p>
        </div>
      </div>

      <DashboardClient
        userId={user.id}
        initialTimeframe="monthly"
        initialReferenceDate={referenceDate}
        initialData={initialData}
      />
    </div>
  );
}
