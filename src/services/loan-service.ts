import { LoanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";

const include = { user: true, book: true } as const;

function positiveId(value: unknown, field: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, `${field} inválido.`);
  return id;
}

function validDate(value: unknown, field: string) {
  if (typeof value !== "string" && !(value instanceof Date)) throw new ApiError(400, `${field} inválida.`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, `${field} inválida.`);
  return date;
}

export const loanService = {
  list(status?: LoanStatus) {
    return prisma.loan.findMany({
      where: status ? { status } : {},
      include,
      orderBy: { loanDate: "desc" },
    });
  },

  async get(id: number) {
    const loan = await prisma.loan.findUnique({ where: { id }, include });
    if (!loan) throw new ApiError(404, "Empréstimo não encontrado.");
    return loan;
  },

  create(input: Record<string, unknown>) {
    const userId = positiveId(input.userId, "userId");
    const bookId = positiveId(input.bookId, "bookId");

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new ApiError(404, "Usuário não encontrado.");

      const book = await tx.book.findUnique({ where: { id: bookId }, select: { id: true, available: true } });
      if (!book) throw new ApiError(404, "Livro não encontrado.");
      if (!book.available) throw new ApiError(409, "O livro não está disponível para empréstimo.");

      const reservation = await tx.book.updateMany({
        where: { id: bookId, available: true },
        data: { available: false },
      });
      if (reservation.count !== 1) throw new ApiError(409, "O livro não está disponível para empréstimo.");

      return tx.loan.create({
        data: { userId, bookId, status: LoanStatus.ACTIVE },
        include,
      });
    });
  },

  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    if ("status" in input || "bookId" in input) {
      throw new ApiError(400, "Use a rota de devolução para alterar o status ou o livro do empréstimo.");
    }
    const data: { userId?: number; loanDate?: Date } = {};
    if ("userId" in input) data.userId = positiveId(input.userId, "userId");
    if ("loanDate" in input) data.loanDate = validDate(input.loanDate, "loanDate");
    return prisma.loan.update({ where: { id }, data, include });
  },

  returnBook(id: number) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id }, include });
      if (!loan) throw new ApiError(404, "Empréstimo não encontrado.");
      if (loan.status === LoanStatus.RETURNED) throw new ApiError(409, "Este empréstimo já foi devolvido.");

      const returned = await tx.loan.updateMany({
        where: { id, status: LoanStatus.ACTIVE },
        data: { status: LoanStatus.RETURNED, returnDate: new Date() },
      });
      if (returned.count !== 1) throw new ApiError(409, "Este empréstimo já foi devolvido.");

      await tx.book.update({ where: { id: loan.bookId }, data: { available: true } });
      return tx.loan.findUniqueOrThrow({ where: { id }, include });
    });
  },

  async remove(id: number) {
    const loan = await this.get(id);
    if (loan.status !== LoanStatus.RETURNED) {
      throw new ApiError(409, "Somente empréstimos devolvidos podem ser excluídos.");
    }
    return prisma.loan.delete({ where: { id } });
  },
};
