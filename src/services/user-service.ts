import { LoanStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

function userData(input: Record<string, unknown>) {
  const name = requiredString(input.name, "name");
  const email = requiredString(input.email, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "email inválido.");
  }
  return { name, email };
}

export const userService = {
  list: () => prisma.user.findMany({
    include: { _count: { select: { loans: true } } },
    orderBy: { name: "asc" },
  }),

  async get(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        loans: {
          include: { book: true },
          orderBy: { loanDate: "desc" },
        },
      },
    });
    if (!user) throw new ApiError(404, "Usuário não encontrado.");
    return user;
  },

  async create(input: Record<string, unknown>) {
    const payload = userData(input);
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new ApiError(409, "Já existe um usuário com esse email.");
    return prisma.user.create({ data: payload });
  },

  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const payload = userData(input);
    const duplicate = await prisma.user.findFirst({
      where: { email: payload.email, NOT: { id } },
    });
    if (duplicate) throw new ApiError(409, "Já existe um usuário com esse email.");
    return prisma.user.update({ where: { id }, data: payload });
  },

  async remove(id: number) {
    const user = await this.get(id);
    if (user.loans.some((loan) => loan.status === LoanStatus.ACTIVE)) {
      throw new ApiError(409, "Não é possível excluir o usuário porque há empréstimos ativos.");
    }
    const [, deletedUser] = await prisma.$transaction([
      prisma.loan.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return deletedUser;
  },
};
