import { z } from "zod";

const authorId = z.coerce.number({ error: "authorId é obrigatório." })
  .int("authorId inválido.").positive("authorId inválido.");

const publishedYear = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? null : value,
  z.coerce.number({ error: "publishedYear deve ser um número válido." })
    .int("publishedYear deve ser um número inteiro.")
    .min(0, "publishedYear inválido.")
    .max(9999, "publishedYear inválido.")
    .nullable(),
);

const categoryIds = z.array(
  z.coerce.number().int("categoryIds contém um ID inválido.").positive("categoryIds contém um ID inválido."),
  { error: "categoryIds deve ser um array." },
);

export const bookCreateSchema = z.object({
  title: z.string({ error: "title é obrigatório." }).trim().min(1, "title é obrigatório."),
  description: z.string().trim().nullable().optional()
    .transform((value) => value === undefined ? undefined : value || null),
  publishedYear: publishedYear.optional().default(null),
  authorId,
  categoryIds: categoryIds.optional().default([]),
});

export const bookUpdateSchema = z.object({
  title: z.string().trim().min(1, "title é obrigatório.").optional(),
  description: z.string().trim().nullable().optional()
    .transform((value) => value === undefined ? undefined : value || null),
  publishedYear: publishedYear.optional(),
  authorId: authorId.optional(),
  available: z.boolean({ error: "available deve ser booleano." }).optional(),
  categoryIds: categoryIds.optional(),
});
