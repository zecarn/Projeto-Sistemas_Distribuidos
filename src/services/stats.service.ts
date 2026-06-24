import { LoanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const statsService = {
  async get() {
    const [books, authors, categories, available, users, activeLoans] = await prisma.$transaction([
      prisma.book.count(),
      prisma.author.count(),
      prisma.category.count(),
      prisma.book.count({ where: { available: true } }),
      prisma.user.count(),
      prisma.loan.count({ where: { status: LoanStatus.ACTIVE } }),
    ]);
    return { books, authors, categories, available, users, activeLoans, borrowed: books - available };
  },
};
