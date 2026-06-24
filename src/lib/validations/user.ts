import { z } from "zod";

export const userSchema = z.object({
  name: z.string({ error: "name é obrigatório." }).trim().min(1, "name é obrigatório."),
  email: z.string({ error: "email é obrigatório." })
    .trim().min(1, "email é obrigatório.").email("email inválido.").toLowerCase(),
});
