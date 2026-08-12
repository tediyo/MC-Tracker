import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPlanById } from "@/lib/data/plans";
import { PlanForm } from "@/components/forms/plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Target } from "lucide-react";

export default async function EditPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { planId } = await params;
  const plan = await fetchPlanById(supabase, planId);
  if (!plan || plan.user_id !== user.id) notFound();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Budget Plan</h1>
          <p className="text-sm text-muted-foreground">
            Update budget target limits and savings goals for this period.
          </p>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-semibold tracking-normal uppercase text-muted-foreground">
            Plan Allocation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlanForm userId={user.id} mode="edit" initialMonth={plan.month} initialYear={plan.year} plan={plan} />
        </CardContent>
      </Card>
    </div>
  );
}
