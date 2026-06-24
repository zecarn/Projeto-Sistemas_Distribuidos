import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoanStatus } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    book: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    bookCategory: { deleteMany: vi.fn() },
    loan: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { bookService } from "@/services/book-service";

describe("bookService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("compõe filtros de título, autor e categoria", async () => {
    prismaMock.book.findMany.mockResolvedValue([]);
    await bookService.list({ title: "dom", authorId: 1, categoryId: 2 });
    expect(prismaMock.book.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        title: { contains: "dom", mode: "insensitive" },
        authorId: 1,
        categories: { some: { categoryId: 2 } },
      },
    }));
  });

  it("valida título e authorId na criação", () => {
    expect(() => bookService.create({ authorId: 1 })).toThrowError("title é obrigatório.");
    expect(() => bookService.create({ title: "Livro", authorId: 0 })).toThrowError("authorId inválido.");
    expect(prismaMock.book.create).not.toHaveBeenCalled();
  });

  it("cria os vínculos de categoria", async () => {
    prismaMock.book.create.mockResolvedValue({ id: 1 });
    await bookService.create({ title: "Livro", authorId: 2, categoryIds: [3, 4] });
    expect(prismaMock.book.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: "Livro", authorId: 2,
        categories: { create: [{ categoryId: 3 }, { categoryId: 4 }] },
      }),
    }));
  });

  it("substitui categorias somente quando categoryIds é enviado", async () => {
    prismaMock.book.findUnique.mockResolvedValue({ id: 1, loans: [], categories: [], author: {} });
    prismaMock.book.update.mockResolvedValue({ id: 1 });
    await bookService.update(1, { available: false, categoryIds: [5] });
    expect(prismaMock.book.update).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        available: false,
        categories: { deleteMany: {}, create: [{ categoryId: 5 }] },
      },
    }));
  });

  it("impede exclusão quando há empréstimo ativo", async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      id: 1, loans: [{ id: 10, status: LoanStatus.ACTIVE }], categories: [], author: {},
    });
    await expect(bookService.remove(1)).rejects.toMatchObject({
      status: 409,
      message: "Não é possível excluir o livro porque há empréstimos ativos.",
    });
    expect(prismaMock.book.delete).not.toHaveBeenCalled();
  });

  it("exclui vínculos, histórico encerrado e livro em uma transação", async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      id: 1, loans: [{ id: 10, status: LoanStatus.RETURNED }], categories: [], author: {},
    });
    prismaMock.bookCategory.deleteMany.mockReturnValue("categories");
    prismaMock.loan.deleteMany.mockReturnValue("loans");
    prismaMock.book.delete.mockReturnValue("book");
    prismaMock.$transaction.mockResolvedValue([{ count: 1 }, { count: 1 }, { id: 1 }]);
    await expect(bookService.remove(1)).resolves.toMatchObject({ id: 1 });
    expect(prismaMock.$transaction).toHaveBeenCalledWith(["categories", "loans", "book"]);
  });
});
