import { NextResponse } from "next/server";
import { handleApiError, parseId, readJson } from "@/lib/api";
import { bookService } from "@/services/book-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const title = searchParams.get("title")?.trim() || undefined;
    const author = searchParams.get("authorId");
    const category = searchParams.get("categoryId");
    return NextResponse.json(await bookService.list({
      title,
      authorId: author ? parseId(author) : undefined,
      categoryId: category ? parseId(category) : undefined,
    }));
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
