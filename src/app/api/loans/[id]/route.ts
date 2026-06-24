import { NextResponse } from "next/server";
import { handleApiError, parseId, readJson } from "@/lib/api";
import { loanService } from "@/services/loan-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    return NextResponse.json(await loanService.get(parseId((await params).id)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const loan = await loanService.update(parseId((await params).id), await readJson(request));
    return NextResponse.json(loan);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const loan = await loanService.remove(parseId((await params).id));
    return NextResponse.json({ message: "Empréstimo excluído com sucesso.", loan });
  } catch (error) {
    return handleApiError(error);
  }
}
