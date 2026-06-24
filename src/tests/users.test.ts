import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoanStatus } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(),
      create: vi.fn(), update: vi.fn(), delete: vi.fn(),
    },
    loan: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { userService } from "@/services/user-service";

describe("userService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deve listar usuários", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    await userService.list();
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      include: { _count: { select: { loans: true } } }, orderBy: { name: "asc" },
    });
  });

  it("deve criar usuário válido", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: 1, name: "Ana", email: "ana@example.com" });
    await expect(userService.create({ name: "Ana", email: "ANA@EXAMPLE.COM" }))
      .resolves.toMatchObject({ id: 1, email: "ana@example.com" });
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { name: "Ana", email: "ana@example.com" },
    });
  });

  it("valida nome e formato do email", async () => {
    await expect(userService.create({ email: "ana@example.com" })).rejects.toThrowError("name é obrigatório.");
    await expect(userService.create({ name: "Ana", email: "email-invalido" })).rejects.toThrowError("email inválido.");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("não deve criar usuário com email duplicado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: "ana@example.com" });
    await expect(userService.create({ name: "Ana", email: "ANA@EXAMPLE.COM" })).rejects.toMatchObject({
      status: 409, message: "Já existe um usuário com esse email.",
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "ana@example.com" } });
  });

  it("inclui livros no histórico de empréstimos", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, loans: [] });
    await userService.get(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { loans: { include: { book: true }, orderBy: { loanDate: "desc" } } },
    });
  });

  it("não deve excluir usuário com empréstimo ativo", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, loans: [{ status: LoanStatus.ACTIVE }] });
    await expect(userService.remove(1)).rejects.toMatchObject({
      status: 409, message: "Não é possível excluir o usuário porque há empréstimos ativos.",
    });
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("remove históricos encerrados e usuário em uma transação", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, loans: [{ status: LoanStatus.RETURNED }] });
    prismaMock.loan.deleteMany.mockReturnValue("loans");
    prismaMock.user.delete.mockReturnValue("user");
    prismaMock.$transaction.mockResolvedValue([{ count: 1 }, { id: 1 }]);
    await expect(userService.remove(1)).resolves.toMatchObject({ id: 1 });
    expect(prismaMock.$transaction).toHaveBeenCalledWith(["loans", "user"]);
  });
});
