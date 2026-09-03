import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedHistoryTable, type TransactionTypeFilter } from "@/components/history/unified-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  let initialType: TransactionTypeFilter = "all";
  if (params?.type === "cost" || params?.type === "costs") {
    initialType = "cost";
  } else if (params?.type === "income") {
    initialType = "income";
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Transaction History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filter, search, and manage your complete history of expenses and income.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl font-semibold">
            <Link href="/costs">
              <Plus className="h-4 w-4 text-rose-500" />
              <span>Log Expense</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl font-semibold">
            <Link href="/income">
              <Plus className="h-4 w-4 text-emerald-500" />
              <span>Log Income</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm font-bold text-foreground">All Transaction Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <UnifiedHistoryTable userId={user.id} initialTypeFilter={initialType} />
        </CardContent>
      </Card>
    </div>
  );
}
