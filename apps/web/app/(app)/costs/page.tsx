import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CostEntryForm } from "@/components/forms/cost-entry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { History, ChevronRight } from "lucide-react";

export default async function CostsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Log Expenses</h1>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 self-start sm:self-auto rounded-xl font-semibold hover:bg-accent">
          <Link href="/costs/history" prefetch={true}>
            <History className="h-4 w-4 text-emerald-500" />
            <span>View Full History</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground">
            Expense Entry
          </CardTitle>
          <Link
            href="/costs/history"
            prefetch={true}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <CostEntryForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
