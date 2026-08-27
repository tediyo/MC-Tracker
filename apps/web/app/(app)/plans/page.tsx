import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlansForYear } from "@/lib/data/plans";
import { PlanYearGrid } from "@/components/plans/plan-year-grid";
import { getEthiopianDate } from "@mc-tracker/shared-types";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { year: yearParam } = await searchParams;
  const currentEthYear = getEthiopianDate(new Date()).year;
  const year = yearParam ? Number(yearParam) : currentEthYear;
  const plans = await fetchPlansForYear(supabase, user.id, year);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Annual Budget Plans (Ethiopian Calendar)
          </h1>
          <p className="text-sm text-muted-foreground">
            Set monthly cost limits and savings goals for {year} E.C. (ዓ.ም.).
          </p>
        </div>
      </div>

      <PlanYearGrid year={year} plans={plans} />
    </div>
  );
}
