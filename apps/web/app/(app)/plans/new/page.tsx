import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlansForYear } from "@/lib/data/plans";
import { PlanForm } from "@/components/forms/plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Target } from "lucide-react";

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

  const plansThisYear = await fetchPlansForYear(supabase, user.id, initialYear);
  const existingPeriods = new Set(plansThisYear.map((p) => `${p.year}-${p.month}`));

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Budget Plan</h1>
          <p className="text-sm text-muted-foreground">
            Establish cost thresholds and target savings for the selected month.
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-semibold tracking-normal uppercase text-muted-foreground">
            New Monthly Budget Target
          </CardTitle>
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
