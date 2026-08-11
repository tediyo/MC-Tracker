import Link from "next/link";
import { Plus } from "lucide-react";
import type { PlanRow } from "@mc-tracker/shared-types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PlanMonthCard({ month, year, plan }: { month: number; year: number; plan?: PlanRow }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">{MONTH_NAMES[month - 1]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan ? (
          <>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cost limit</dt>
                <dd className="font-medium">{formatCurrency(Number(plan.target_cost_limit))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Savings goal</dt>
                <dd className="font-medium">{formatCurrency(Number(plan.target_savings_goal))}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm">
              <Link href={`/plans/${plan.id}/edit`}>Edit</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">No plan set</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/plans/new?month=${month}&year=${year}`}>
                <Plus className="h-3.5 w-3.5" />
                Create
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
