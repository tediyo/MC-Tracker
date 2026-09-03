import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedHistoryTable } from "@/components/history/unified-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CostHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Expense History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filter, search, and manage your complete history of expenses.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl font-semibold self-start sm:self-auto">
          <Link href="/costs">
            <Plus className="h-4 w-4 text-rose-500" />
            <span>Log Expense</span>
          </Link>
        </Button>
      </div>
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-bold text-foreground">Expense Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <UnifiedHistoryTable userId={user.id} initialTypeFilter="cost" />
        </CardContent>
      </Card>
    </div>
  );
}
