import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CostEntryForm } from "@/components/forms/cost-entry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Receipt, History } from "lucide-react";

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Log Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Add daily expenses, categorizing costs into Basic, Fancy, or Extra tiers.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
          <Link href="/costs/history" prefetch={true}>
            <History className="h-4 w-4" />
            View Expense History
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Daily Cost Entry Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CostEntryForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
