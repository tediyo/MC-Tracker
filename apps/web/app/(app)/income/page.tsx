import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IncomeEntryForm } from "@/components/forms/income-entry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { PiggyBank, History } from "lucide-react";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
            <PiggyBank className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Log Income Entry</h1>
            <p className="text-sm text-muted-foreground">
              Record salary, freelance earnings, or secondary income streams.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start sm:self-auto">
          <Link href="/income/history">
            <History className="h-4 w-4" />
            View Income History
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-sm font-semibold tracking-normal uppercase text-muted-foreground">
            Monthly &amp; Secondary Income Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeEntryForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
