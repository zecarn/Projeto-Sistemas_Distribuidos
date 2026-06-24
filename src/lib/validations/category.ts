import { z } from "zod";

export const categorySchema = z.object({
  name: z.string({ error: "name é obrigatório." }).trim().min(1, "name é obrigatório."),
});
