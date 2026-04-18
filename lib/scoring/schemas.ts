import { z } from "zod";

export const scoreInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  stablefordScore: z.number().int().min(1).max(45),
});

