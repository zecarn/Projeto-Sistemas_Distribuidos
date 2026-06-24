import { NextResponse } from "next/server";
import { handleApiError, parseId, readJson } from "@/lib/api";
import { categoryService } from "@/services/category-service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    return NextResponse.json(await categoryService.get(parseId((await params).id)));
  } catch (error) { return handleApiError(error); }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    return NextResponse.json(await categoryService.update(parseId((await params).id), await readJson(request)));
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await categoryService.remove(parseId((await params).id));
    return new NextResponse(null, { status: 204 });
  } catch (error) { return handleApiError(error); }
}
