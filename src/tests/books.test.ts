import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoanStatus } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    book: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    author: { findUnique: vi.fn() },
    bookCategory: { deleteMany: vi.fn() },
    loan: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { bookService } from "@/services/book-service";

describe("bookService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deve listar livros", async () => {
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

  it("não deve criar livro sem título", async () => {
    await expect(bookService.create({ authorId: 1 })).rejects.toThrowError("title é obrigatório.");
    expect(prismaMock.book.create).not.toHaveBeenCalled();
  });

  it("deve validar authorId na criação", async () => {
    await expect(bookService.create({ title: "Livro", authorId: 0 })).rejects.toThrowError("authorId inválido.");
    expect(prismaMock.book.create).not.toHaveBeenCalled();
  });

  it("valida publishedYear e o formato de categoryIds", async () => {
    await expect(bookService.create({ title: "Livro", authorId: 1, publishedYear: "abc" }))
      .rejects.toThrowError("publishedYear deve ser um número válido.");
    await expect(bookService.create({ title: "Livro", authorId: 1, categoryIds: "1" }))
      .rejects.toThrowError("categoryIds deve ser um array.");
  });

  it("exige que o autor exista", async () => {
    prismaMock.author.findUnique.mockResolvedValue(null);
    await expect(bookService.create({ title: "Livro", authorId: 99 })).rejects.toMatchObject({
      status: 404, message: "Autor não encontrado.",
    });
    expect(prismaMock.book.create).not.toHaveBeenCalled();
  });

  it("deve criar livro válido", async () => {
    prismaMock.author.findUnique.mockResolvedValue({ id: 2 });
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

  it("não deve excluir livro com empréstimo ativo", async () => {
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
