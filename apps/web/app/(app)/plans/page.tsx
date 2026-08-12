import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlansForYear } from "@/lib/data/plans";
import { PlanYearGrid } from "@/components/plans/plan-year-grid";

import { Target } from "lucide-react";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { year: yearParam } = await searchParams;
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();
  const plans = await fetchPlansForYear(supabase, user.id, year);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Annual Budget Plans
            </h1>
            <p className="text-sm text-muted-foreground">
              Set monthly income targets, cost limits, and savings goals for {year}.
            </p>
          </div>
        </div>
      </div>

      <PlanYearGrid year={year} plans={plans} />
    </div>
  );
}
