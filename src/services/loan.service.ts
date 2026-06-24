import { LoanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/AppError";
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
    if (!loan) throw new AppError("Empréstimo não encontrado.", 404);
    return loan;
  },

  create(input: Record<string, unknown>) {
    const { userId, bookId } = validate(loanCreateSchema, input);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new AppError("Usuário não encontrado.", 404);

      const book = await tx.book.findUnique({ where: { id: bookId }, select: { id: true, available: true } });
      if (!book) throw new AppError("Livro não encontrado.", 404);
      if (!book.available) throw new AppError("O livro não está disponível para empréstimo.", 409);

      const reservation = await tx.book.updateMany({
        where: { id: bookId, available: true },
        data: { available: false },
      });
      if (reservation.count !== 1) throw new AppError("O livro não está disponível para empréstimo.", 409);

      return tx.loan.create({
        data: { userId, bookId, status: LoanStatus.ACTIVE },
        include,
      });
    });
  },

  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    if ("status" in input || "bookId" in input) {
      throw new AppError("Use a rota de devolução para alterar o status ou o livro do empréstimo.", 400);
    }
    const data = validate(loanUpdateSchema, input);
    if (data.userId !== undefined) {
      const user = await prisma.user.findUnique({ where: { id: data.userId }, select: { id: true } });
      if (!user) throw new AppError("Usuário não encontrado.", 404);
    }
    return prisma.loan.update({ where: { id }, data, include });
  },

  returnBook(id: number) {
    return prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id }, include });
      if (!loan) throw new AppError("Empréstimo não encontrado.", 404);
      if (loan.status === LoanStatus.RETURNED) throw new AppError("Este empréstimo já foi devolvido.", 409);

      const returned = await tx.loan.updateMany({
        where: { id, status: LoanStatus.ACTIVE },
        data: { status: LoanStatus.RETURNED, returnDate: new Date() },
      });
      if (returned.count !== 1) throw new AppError("Este empréstimo já foi devolvido.", 409);

      await tx.book.update({ where: { id: loan.bookId }, data: { available: true } });
      return tx.loan.findUniqueOrThrow({ where: { id }, include });
    });
  },

  async remove(id: number) {
    const loan = await this.get(id);
    if (loan.status !== LoanStatus.RETURNED) {
      throw new AppError("Somente empréstimos devolvidos podem ser excluídos.", 409);
    }
    return prisma.loan.delete({ where: { id } });
  },
};
