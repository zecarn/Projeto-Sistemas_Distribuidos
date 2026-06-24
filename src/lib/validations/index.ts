import { z } from "zod";
import { ApiError } from "@/lib/api";

export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message ?? "Dados inválidos.");
  }
  return result.data;
}

export * from "./author";
export * from "./book";
export * from "./category";
export * from "./loan";
export * from "./user";
