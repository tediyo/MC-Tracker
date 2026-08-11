import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlansForYear } from "@/lib/data/plans";
import { PlanForm } from "@/components/forms/plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const { month: monthParam, year: yearParam } = await searchParams;
  const initialMonth = monthParam ? Number(monthParam) : now.getMonth() + 1;
  const initialYear = yearParam ? Number(yearParam) : now.getFullYear();

  // Only covers `initialYear` - if the picker's year is changed client-side
  // to a different year, this disabled-set won't reflect that year's
  // existing plans. Acceptable because layer 3 (the unique-violation catch
  // in createPlan) still blocks a genuine duplicate regardless.
  const plansThisYear = await fetchPlansForYear(supabase, user.id, initialYear);
  const existingPeriods = new Set(plansThisYear.map((p) => `${p.year}-${p.month}`));

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Create Plan</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Monthly budget target</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm
            userId={user.id}
            mode="create"
            initialMonth={initialMonth}
            initialYear={initialYear}
            existingPeriods={existingPeriods}
          />
        </CardContent>
      </Card>
    </div>
  );
}
