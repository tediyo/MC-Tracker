import { z } from "zod";

export const createPlanSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  target_cost_limit: z.coerce.number().min(0, "Target cost limit cannot be negative"),
  target_savings_goal: z.coerce.number().min(0, "Target savings goal cannot be negative"),
});

/** Edit mode never changes month/year — identity of a plan is fixed once created. */
export const updatePlanSchema = createPlanSchema.omit({ month: true, year: true });

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
