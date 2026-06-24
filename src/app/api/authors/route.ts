import { NextResponse } from "next/server";
import { handleApiError, readJson } from "@/lib/api";
import { authorService } from "@/services/author.service";

export async function GET() {
  try {
    return NextResponse.json(await authorService.list());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await authorService.create(await readJson(request)), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
