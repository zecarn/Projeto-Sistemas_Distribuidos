import { NextResponse } from "next/server";
import { AppError } from "./AppError";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error("Erro não tratado na API:", error);
  return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
}
