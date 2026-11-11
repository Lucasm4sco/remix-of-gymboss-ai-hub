import { z } from "zod";

// Keep this contract as narrow as the database's public booking projection.
export const publicBookingSchema = z.object({
  academy: z.object({
    id: z.string(), name: z.string(), slug: z.string(),
    cor_primaria: z.string().nullable(), telefone: z.string().nullable(),
  }).strict(),
  plans: z.array(z.object({
    id: z.string(), name: z.string(), description: z.string().nullable(),
    price: z.number(), featured: z.boolean(),
  }).strict()),
  schedule: z.array(z.object({
    id: z.string(), name: z.string(), modality: z.string().nullable(),
    day_of_week: z.number(), start_time: z.string(), end_time: z.string(),
  }).strict()),
}).strict();