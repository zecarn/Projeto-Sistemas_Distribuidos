import { LoanStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

const listInclude = {
  author: true,
  categories: { include: { category: true } },
} as const;

const detailInclude = {
  ...listInclude,
  loans: { include: { user: true }, orderBy: { loanDate: "desc" as const } },
} as const;

export type BookFilters = { title?: string; authorId?: number; categoryId?: number };

function optionalText(value: unknown, field: string) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new ApiError(400, `${field} inválido.`);
  return value.trim() || null;
}

function optionalYear(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const year = Number(value);
  if (!Number.isInteger(year) || year < 0 || year > 9999) throw new ApiError(400, "publishedYear inválido.");
  return year;
}

function validAuthorId(value: unknown) {
  const authorId = Number(value);
  if (!Number.isInteger(authorId) || authorId <= 0) throw new ApiError(400, "authorId inválido.");
  return authorId;
}

function categoryIdsFrom(value: unknown) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new ApiError(400, "categoryIds deve ser uma lista.");
  const categoryIds = [...new Set(value.map(Number))];
  if (categoryIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ApiError(400, "categoryIds contém um ID inválido.");
  }
  return categoryIds;
}

export const bookService = {
  list(filters: BookFilters = {}) {
    const where: Prisma.BookWhereInput = {};
    if (filters.title) where.title = { contains: filters.title, mode: "insensitive" };
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.categoryId) where.categories = { some: { categoryId: filters.categoryId } };
    return prisma.book.findMany({ where, include: listInclude, orderBy: { title: "asc" } });
  },

  async get(id: number) {
    const book = await prisma.book.findUnique({ where: { id }, include: detailInclude });
    if (!book) throw new ApiError(404, "Livro não encontrado.");
    return book;
  },

  create(input: Record<string, unknown>) {
    const title = requiredString(input.title, "title");
    const authorId = validAuthorId(input.authorId);
    const categoryIds = categoryIdsFrom(input.categoryIds) ?? [];
    return prisma.book.create({
      data: {
        title,
        description: optionalText(input.description, "description"),
        publishedYear: optionalYear(input.publishedYear),
        authorId,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      },
      include: listInclude,
    });
  },

  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const data: {
      title?: string;
      description?: string | null;
      publishedYear?: number | null;
      authorId?: number;
      available?: boolean;
    } = {};

    if ("title" in input) data.title = requiredString(input.title, "title");
    if ("description" in input) data.description = optionalText(input.description, "description");
    if ("publishedYear" in input) data.publishedYear = optionalYear(input.publishedYear);
    if ("authorId" in input) data.authorId = validAuthorId(input.authorId);
    if ("available" in input) {
      if (typeof input.available !== "boolean") throw new ApiError(400, "available deve ser booleano.");
      data.available = input.available;
    }

    const categoryIds = categoryIdsFrom(input.categoryIds);
    return prisma.book.update({
      where: { id },
      data: {
        ...data,
        ...(categoryIds === undefined
          ? {}
          : { categories: { deleteMany: {}, create: categoryIds.map((categoryId) => ({ categoryId })) } }),
      },
      include: listInclude,
    });
  },

  async remove(id: number) {
    const book = await this.get(id);
    if (book.loans.some((loan) => loan.status === LoanStatus.ACTIVE)) {
      throw new ApiError(409, "Não é possível excluir o livro porque há empréstimos ativos.");
    }

    const [, , deletedBook] = await prisma.$transaction([
      prisma.bookCategory.deleteMany({ where: { bookId: id } }),
      prisma.loan.deleteMany({ where: { bookId: id } }),
      prisma.book.delete({ where: { id } }),
    ]);
    return deletedBook;
  },
};
