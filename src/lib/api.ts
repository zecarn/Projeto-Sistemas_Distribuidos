import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, "ID inválido.");
  return id;
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "JSON inválido.");
  }
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new ApiError(400, `${field} é obrigatório.`);
  return value.trim();
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
    return NextResponse.json({ error: "Já existe um registro com esses dados." }, { status: 409 });
  }
  if (typeof error === "object" && error && "code" in error && error.code === "P2003") {
    return NextResponse.json({ error: "O registro está sendo utilizado e não pode ser removido." }, { status: 409 });
  }
  console.error(error);
  return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
}
