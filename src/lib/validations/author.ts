import { z } from "zod";

export const authorSchema = z.object({
  name: z.string({ error: "name é obrigatório." }).trim().min(1, "name é obrigatório."),
  bio: z.string().trim().nullable().optional().transform((value) => value || null),
});
