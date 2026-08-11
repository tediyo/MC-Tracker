import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IncomeEntryForm } from "@/components/forms/income-entry-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add Income</h1>
        <Button asChild variant="outline">
          <Link href="/income/history">View history</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Monthly &amp; other income</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeEntryForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
