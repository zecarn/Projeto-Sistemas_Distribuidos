import { NextResponse } from "next/server";
import { readJson } from "@/lib/api";
import { handleApiError } from "@/lib/errors/handleApiError";
import { userService } from "@/services/user.service";

export async function GET() {
  try {
    return NextResponse.json(await userService.list());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await userService.create(await readJson(request));
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
