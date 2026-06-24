import { NextResponse } from "next/server";
import { handleApiError, readJson } from "@/lib/api";
import { bookService } from "@/services/book-service";

export async function GET() {
  try {
    return NextResponse.json(await bookService.list());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await bookService.create(await readJson(request)), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
