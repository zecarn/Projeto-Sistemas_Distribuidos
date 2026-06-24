import { NextResponse } from "next/server";
import { parseId, readJson } from "@/lib/api";
import { handleApiError } from "@/lib/errors/handleApiError";
import { bookService } from "@/services/book.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    return NextResponse.json(await bookService.get(parseId((await params).id)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    return NextResponse.json(await bookService.update(parseId((await params).id), await readJson(request)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const book = await bookService.remove(parseId((await params).id));
    return NextResponse.json({ message: "Livro excluído com sucesso.", book });
  } catch (error) {
    return handleApiError(error);
  }
}
