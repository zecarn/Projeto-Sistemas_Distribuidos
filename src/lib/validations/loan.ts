import { z } from "zod";

const requiredId = (field: "userId" | "bookId") => z.coerce
  .number({ error: `${field} é obrigatório.` })
  .int(`${field} inválido.`)
  .positive(`${field} inválido.`);

export const loanCreateSchema = z.object({
  userId: requiredId("userId"),
  bookId: requiredId("bookId"),
});

export const loanUpdateSchema = z.object({
  userId: requiredId("userId").optional(),
  loanDate: z.coerce.date({ error: "loanDate inválida." }).optional(),
});
