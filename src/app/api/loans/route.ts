import { LoanStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { ApiError, handleApiError, readJson } from "@/lib/api";
import { loanService } from "@/services/loan-service";

export async function GET(request: Request) {
  try {
    const value = new URL(request.url).searchParams.get("status");
    if (value && !Object.values(LoanStatus).includes(value as LoanStatus)) {
      throw new ApiError(400, "status deve ser ACTIVE ou RETURNED.");
    }
    return NextResponse.json(await loanService.list(value as LoanStatus | undefined));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const loan = await loanService.create(await readJson(request));
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
