import { LoanStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { bookCreateSchema, bookUpdateSchema, validate } from "@/lib/validations";

const listInclude = {
  author: true,
  categories: { include: { category: true } },
} as const;

const detailInclude = {
  ...listInclude,
  loans: { include: { user: true }, orderBy: { loanDate: "desc" as const } },
} as const;

export type BookFilters = { title?: string; authorId?: number; categoryId?: number };

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

  async create(input: Record<string, unknown>) {
    const payload = validate(bookCreateSchema, input);
    const author = await prisma.author.findUnique({ where: { id: payload.authorId }, select: { id: true } });
    if (!author) throw new ApiError(404, "Autor não encontrado.");
    const categoryIds = [...new Set(payload.categoryIds)];
    return prisma.book.create({
      data: {
        title: payload.title,
        description: payload.description,
        publishedYear: payload.publishedYear,
        authorId: payload.authorId,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      },
      include: listInclude,
    });
  },

  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const payload = validate(bookUpdateSchema, input);
    const { categoryIds: rawCategoryIds, ...data } = payload;
    if (data.authorId !== undefined) {
      const author = await prisma.author.findUnique({ where: { id: data.authorId }, select: { id: true } });
      if (!author) throw new ApiError(404, "Autor não encontrado.");
    }
    const categoryIds = rawCategoryIds === undefined ? undefined : [...new Set(rawCategoryIds)];
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
