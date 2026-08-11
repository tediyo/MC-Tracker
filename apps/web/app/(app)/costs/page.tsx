import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CostEntryForm } from "@/components/forms/cost-entry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add Costs</h1>
        <Button asChild variant="outline">
          <Link href="/costs/history">View history</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Daily costs</CardTitle>
        </CardHeader>
        <CardContent>
          <CostEntryForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
