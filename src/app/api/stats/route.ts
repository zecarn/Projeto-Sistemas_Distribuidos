import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const [books, authors, categories, available] = await prisma.$transaction([
      prisma.book.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.book.count({ where: { available: true } }),
    ]);
    return NextResponse.json({ books, authors, categories, available });
  } catch (error) {
    return handleApiError(error);
  }
}
