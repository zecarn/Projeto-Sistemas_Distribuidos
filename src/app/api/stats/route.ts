import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { statsService } from "@/services/stats.service";

export async function GET() {
  try {
    return NextResponse.json(await statsService.get());
  } catch (error) {
    return handleApiError(error);
  }
}
