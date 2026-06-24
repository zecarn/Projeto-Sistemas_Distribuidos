import { LoanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { loanCreateSchema, loanUpdateSchema, validate } from "@/lib/validations";

const include = { user: true, book: true } as const;

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
    const { userId, bookId } = validate(loanCreateSchema, input);

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
    const data = validate(loanUpdateSchema, input);
    if (data.userId !== undefined) {
      const user = await prisma.user.findUnique({ where: { id: data.userId }, select: { id: true } });
      if (!user) throw new ApiError(404, "Usuário não encontrado.");
    }
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
