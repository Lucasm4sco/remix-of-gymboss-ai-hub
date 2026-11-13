import { z } from "zod";

// Only fields already exposed by the academy plan form may be changed.
export const planFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do plano."),
  description: z.string(),
  price: z.number().finite().nonnegative("O preço não pode ser negativo."),
  duration_months: z.number().int().positive("Informe uma duração inteira maior que zero."),
  featured: z.boolean(),
}).strict();

export type PlanForm = z.infer<typeof planFormSchema>;

export const emptyPlanForm = (): PlanForm => ({ name: "", price: 0, duration_months: 1, description: "", featured: false });