import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

const include = { category: true, authors: true } as const;

function bookData(input: Record<string, unknown>) {
  const categoryId = Number(input.categoryId);
  const authorIds = Array.isArray(input.authorIds) ? input.authorIds.map(Number) : [];
  if (!Number.isInteger(categoryId) || categoryId <= 0) throw new ApiError(400, "categoryId inválido.");
  if (!authorIds.length || authorIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ApiError(400, "Informe ao menos um authorId válido.");
  }
  return {
    title: requiredString(input.title, "title"),
    isbn: requiredString(input.isbn, "isbn"),
    available: typeof input.available === "boolean" ? input.available : true,
    publishedAt: input.publishedAt ? new Date(String(input.publishedAt)) : null,
    categoryId,
    authors: { connect: [...new Set(authorIds)].map((id) => ({ id })) },
  };
}

export const bookService = {
  list: () => prisma.book.findMany({ include, orderBy: { title: "asc" } }),
  async get(id: number) {
    const book = await prisma.book.findUnique({ where: { id }, include });
    if (!book) throw new ApiError(404, "Livro não encontrado.");
    return book;
  },
  create: (input: Record<string, unknown>) => prisma.book.create({ data: bookData(input), include }),
  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const data = bookData(input);
    return prisma.book.update({
      where: { id },
      data: { ...data, authors: { set: [], connect: data.authors.connect } },
      include,
    });
  },
  async remove(id: number) {
    await this.get(id);
    return prisma.book.delete({ where: { id } });
  },
};
