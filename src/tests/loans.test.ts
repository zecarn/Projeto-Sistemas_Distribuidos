import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoanStatus } from "@prisma/client";

const { prismaMock, txMock } = vi.hoisted(() => {
  const tx = {
    user: { findUnique: vi.fn() },
    book: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    loan: { create: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
  };
  return {
    txMock: tx,
    prismaMock: {
      loan: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
      $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { loanService } from "@/services/loan.service";

describe("loanService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((callback) => callback(txMock));
  });

  it("filtra empréstimos pelo status", async () => {
    prismaMock.loan.findMany.mockResolvedValue([]);
    await loanService.list(LoanStatus.ACTIVE);
    expect(prismaMock.loan.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: LoanStatus.ACTIVE }, include: { user: true, book: true },
    }));
  });

  it("verifica a existência do usuário", async () => {
    txMock.user.findUnique.mockResolvedValue(null);
    await expect(loanService.create({ userId: 99, bookId: 1 })).rejects.toMatchObject({
      statusCode: 404, message: "Usuário não encontrado.",
    });
    expect(txMock.book.findUnique).not.toHaveBeenCalled();
  });

  it("não deve emprestar livro indisponível", async () => {
    txMock.user.findUnique.mockResolvedValue({ id: 1 });
    txMock.book.findUnique.mockResolvedValue({ id: 2, available: false });
    await expect(loanService.create({ userId: 1, bookId: 2 })).rejects.toMatchObject({
      statusCode: 409, message: "O livro não está disponível para empréstimo.",
    });
    expect(txMock.loan.create).not.toHaveBeenCalled();
  });

  it("deve criar empréstimo se livro estiver disponível e marcar o livro como indisponível", async () => {
    txMock.user.findUnique.mockResolvedValue({ id: 1 });
    txMock.book.findUnique.mockResolvedValue({ id: 2, available: true });
    txMock.book.updateMany.mockResolvedValue({ count: 1 });
    txMock.loan.create.mockResolvedValue({ id: 3, status: LoanStatus.ACTIVE });
    await expect(loanService.create({ userId: 1, bookId: 2 })).resolves.toMatchObject({ id: 3 });
    expect(txMock.book.updateMany).toHaveBeenCalledWith({
      where: { id: 2, available: true }, data: { available: false },
    });
    expect(txMock.loan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: { userId: 1, bookId: 2, status: LoanStatus.ACTIVE },
    }));
  });

  it("deve devolver livro e marcá-lo como disponível", async () => {
    txMock.loan.findUnique.mockResolvedValue({ id: 3, bookId: 2, status: LoanStatus.ACTIVE });
    txMock.loan.updateMany.mockResolvedValue({ count: 1 });
    txMock.book.update.mockResolvedValue({ id: 2, available: true });
    txMock.loan.findUniqueOrThrow.mockResolvedValue({ id: 3, status: LoanStatus.RETURNED });
    await expect(loanService.returnBook(3)).resolves.toMatchObject({ status: LoanStatus.RETURNED });
    expect(txMock.loan.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 3, status: LoanStatus.ACTIVE },
      data: expect.objectContaining({ status: LoanStatus.RETURNED, returnDate: expect.any(Date) }),
    }));
    expect(txMock.book.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { available: true } });
  });

  it("não deve devolver empréstimo já devolvido", async () => {
    txMock.loan.findUnique.mockResolvedValue({ id: 3, bookId: 2, status: LoanStatus.RETURNED });
    await expect(loanService.returnBook(3)).rejects.toMatchObject({
      statusCode: 409, message: "Este empréstimo já foi devolvido.",
    });
    expect(txMock.loan.updateMany).not.toHaveBeenCalled();
    expect(txMock.book.update).not.toHaveBeenCalled();
  });

  it("só exclui empréstimos devolvidos", async () => {
    prismaMock.loan.findUnique.mockResolvedValue({ id: 1, status: LoanStatus.ACTIVE });
    await expect(loanService.remove(1)).rejects.toMatchObject({
      statusCode: 409, message: "Somente empréstimos devolvidos podem ser excluídos.",
    });
    prismaMock.loan.findUnique.mockResolvedValue({ id: 1, status: LoanStatus.RETURNED });
    prismaMock.loan.delete.mockResolvedValue({ id: 1 });
    await expect(loanService.remove(1)).resolves.toMatchObject({ id: 1 });
  });
});
