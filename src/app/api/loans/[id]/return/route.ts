import { NextResponse } from "next/server";
import { parseId } from "@/lib/api";
import { handleApiError } from "@/lib/errors/handleApiError";
import { loanService } from "@/services/loan.service";

type Context = { params: Promise<{ id: string }> };

export async function PUT(_: Request, { params }: Context) {
  try {
    const loan = await loanService.returnBook(parseId((await params).id));
    return NextResponse.json(loan);
  } catch (error) {
    return handleApiError(error);
  }
}
