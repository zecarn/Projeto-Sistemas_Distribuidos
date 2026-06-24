import { NextResponse } from "next/server";
import { handleApiError, parseId, readJson } from "@/lib/api";
import { userService } from "@/services/user.service";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    return NextResponse.json(await userService.get(parseId((await params).id)));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await userService.update(parseId((await params).id), await readJson(request));
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const user = await userService.remove(parseId((await params).id));
    return NextResponse.json({ message: "Usuário excluído com sucesso.", user });
  } catch (error) {
    return handleApiError(error);
  }
}
