import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CostHistoryTable } from "@/components/history/cost-history-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CostHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cost History</h1>
        <Button asChild variant="outline">
          <Link href="/costs">Add costs</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All cost entries</CardTitle>
        </CardHeader>
        <CardContent>
          <CostHistoryTable userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
