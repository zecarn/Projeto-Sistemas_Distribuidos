import { AppError } from "@/lib/errors/AppError";

export function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError("ID inválido.", 400);
  return id;
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new AppError("JSON inválido.", 400);
  }
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new AppError(`${field} é obrigatório.`, 400);
  return value.trim();
}
