import { z } from "zod";
import { AppError } from "@/lib/errors/AppError";

export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? "Dados inválidos.", 400);
  }
  return result.data;
}

export * from "./author";
export * from "./book";
export * from "./category";
export * from "./loan";
export * from "./user";
