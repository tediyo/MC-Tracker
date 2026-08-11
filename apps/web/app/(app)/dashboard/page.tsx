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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <DashboardClient
        userId={user.id}
        initialTimeframe="monthly"
        initialReferenceDate={referenceDate}
        initialData={initialData}
      />
    </div>
  );
}
