import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlansForYear } from "@/lib/data/plans";
import { PlanYearGrid } from "@/components/plans/plan-year-grid";

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
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Budget Plans</h1>
      <PlanYearGrid year={year} plans={plans} />
    </div>
  );
}
