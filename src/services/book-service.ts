import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

const include = { author: true, categories: { include: { category: true } } } as const;

function bookData(input: Record<string, unknown>) {
  const authorId = Number(input.authorId);
  const categoryIds = Array.isArray(input.categoryIds) ? input.categoryIds.map(Number) : [];
  const publishedYear = input.publishedYear === null || input.publishedYear === "" || input.publishedYear === undefined
    ? null : Number(input.publishedYear);
  if (!Number.isInteger(authorId) || authorId <= 0) throw new ApiError(400, "authorId inválido.");
  if (!categoryIds.length || categoryIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ApiError(400, "Informe ao menos um categoryId válido.");
  }
  if (publishedYear !== null && !Number.isInteger(publishedYear)) throw new ApiError(400, "publishedYear inválido.");
  return {
    scalar: {
      title: requiredString(input.title, "title"),
      description: typeof input.description === "string" && input.description.trim() ? input.description.trim() : null,
      publishedYear,
      available: typeof input.available === "boolean" ? input.available : true,
      authorId,
    },
    categoryIds: [...new Set(categoryIds)],
  };
}

export const bookService = {
  list: () => prisma.book.findMany({ include, orderBy: { title: "asc" } }),
  async get(id: number) {
    const book = await prisma.book.findUnique({ where: { id }, include });
    if (!book) throw new ApiError(404, "Livro não encontrado.");
    return book;
  },
  create(input: Record<string, unknown>) {
    const data = bookData(input);
    return prisma.book.create({
      data: { ...data.scalar, categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) } }, include,
    });
  },
  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const data = bookData(input);
    return prisma.$transaction(async (tx) => {
      await tx.bookCategory.deleteMany({ where: { bookId: id } });
      return tx.book.update({
        where: { id },
        data: { ...data.scalar, categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) } }, include,
      });
    });
  },
  async remove(id: number) {
    await this.get(id);
    return prisma.book.delete({ where: { id } });
  },
};
