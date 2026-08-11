"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createPlanSchema,
  updatePlanSchema,
  type CreatePlanInput,
  type UpdatePlanInput,
  type PlanRow,
} from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { createPlan, updatePlan } from "@/lib/data/plans";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlanMonthYearPicker } from "@/components/forms/plan-month-year-picker";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface PlanFormProps {
  userId: string;
  mode: "create" | "edit";
  initialMonth: number;
  initialYear: number;
  /** (month, year) combos that already have a plan (create mode only). */
  existingPeriods?: ReadonlySet<string>;
  plan?: PlanRow;
}

export function PlanForm({ userId, mode, initialMonth, initialYear, existingPeriods, plan }: PlanFormProps) {
  const router = useRouter();
  const [month, setMonth] = React.useState(initialMonth);
  const [year, setYear] = React.useState(initialYear);
  const [duplicateError, setDuplicateError] = React.useState<string | null>(null);

  const createForm = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      month: initialMonth,
      year: initialYear,
      target_cost_limit: 0,
      target_savings_goal: 0,
    },
  });

  const editForm = useForm<UpdatePlanInput>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {
      target_cost_limit: plan ? Number(plan.target_cost_limit) : 0,
      target_savings_goal: plan ? Number(plan.target_savings_goal) : 0,
    },
  });

  async function onCreateSubmit(values: CreatePlanInput) {
    setDuplicateError(null);
    const supabase = createClient();
    const { plan: created, duplicate } = await createPlan(supabase, userId, { ...values, month, year });
    if (duplicate) {
      setDuplicateError(
        `A plan for ${MONTH_NAMES[month - 1]} ${year} already exists. Edit it instead of creating a new one.`,
      );
      return;
    }
    if (!created) {
      toast.error("Failed to create plan");
      return;
    }
    toast.success("Plan created");
    router.push("/plans");
    router.refresh();
  }

  async function onEditSubmit(values: UpdatePlanInput) {
    if (!plan) return;
    try {
      const supabase = createClient();
      await updatePlan(supabase, plan.id, values);
      toast.success("Plan updated");
      router.push("/plans");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update plan");
    }
  }

  if (mode === "edit") {
    return (
      <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
        <div>
          <Label>Period</Label>
          <p className="text-sm font-medium">
            {MONTH_NAMES[initialMonth - 1]} {initialYear}
          </p>
          <p className="text-xs text-muted-foreground">The month/year of a plan can&rsquo;t be changed after creation.</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="target_cost_limit">Target cost limit (USD)</Label>
          <Input id="target_cost_limit" type="number" step="0.01" min="0" {...editForm.register("target_cost_limit")} />
          {editForm.formState.errors.target_cost_limit ? (
            <p className="text-xs text-destructive">{editForm.formState.errors.target_cost_limit.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="target_savings_goal">Target savings goal (USD)</Label>
          <Input id="target_savings_goal" type="number" step="0.01" min="0" {...editForm.register("target_savings_goal")} />
          {editForm.formState.errors.target_savings_goal ? (
            <p className="text-xs text-destructive">{editForm.formState.errors.target_savings_goal.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={editForm.formState.isSubmitting} className="self-start">
          {editForm.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex flex-col gap-4">
      <PlanMonthYearPicker
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        existingPeriods={existingPeriods ?? new Set()}
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor="target_cost_limit">Target cost limit (USD)</Label>
        <Input
          id="target_cost_limit"
          type="number"
          step="0.01"
          min="0"
          {...createForm.register("target_cost_limit")}
        />
        {createForm.formState.errors.target_cost_limit ? (
          <p className="text-xs text-destructive">{createForm.formState.errors.target_cost_limit.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="target_savings_goal">Target savings goal (USD)</Label>
        <Input
          id="target_savings_goal"
          type="number"
          step="0.01"
          min="0"
          {...createForm.register("target_savings_goal")}
        />
        {createForm.formState.errors.target_savings_goal ? (
          <p className="text-xs text-destructive">{createForm.formState.errors.target_savings_goal.message}</p>
        ) : null}
      </div>
      {duplicateError ? <p className="text-sm text-destructive">{duplicateError}</p> : null}
      <Button type="submit" disabled={createForm.formState.isSubmitting} className="self-start">
        {createForm.formState.isSubmitting ? "Saving…" : "Create plan"}
      </Button>
    </form>
  );
}
