import { NextResponse } from "next/server";
import { readJson } from "@/lib/api";
import { handleApiError } from "@/lib/errors/handleApiError";
import { categoryService } from "@/services/category.service";

export async function GET() {
  try {
    return NextResponse.json(await categoryService.list());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await categoryService.create(await readJson(request)), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
