import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlanById } from "@/lib/data/plans";
import { PlanForm } from "@/components/forms/plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { planId } = await params;
  const plan = await fetchPlanById(supabase, planId);
  // RLS means a plan belonging to another user simply won't be returned -
  // `plan.user_id !== user.id` should be unreachable, but checked anyway.
  if (!plan || plan.user_id !== user.id) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Edit Plan</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Monthly budget target</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm userId={user.id} mode="edit" initialMonth={plan.month} initialYear={plan.year} plan={plan} />
        </CardContent>
      </Card>
    </div>
  );
}
