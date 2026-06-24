import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    author: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { ApiError } from "@/lib/api";
import { authorService } from "@/services/author-service";

describe("authorService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista autores incluindo seus livros", async () => {
    prismaMock.author.findMany.mockResolvedValue([]);
    await authorService.list();
    expect(prismaMock.author.findMany).toHaveBeenCalledWith({
      include: { books: true, _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
  });

  it("rejeita criação sem nome", () => {
    expect(() => authorService.create({ bio: "Biografia" })).toThrowError("name é obrigatório.");
    expect(prismaMock.author.create).not.toHaveBeenCalled();
  });

  it("deve criar autor", async () => {
    prismaMock.author.create.mockResolvedValue({ id: 1, name: "George Orwell", bio: null });
    await expect(authorService.create({ name: "George Orwell" })).resolves.toMatchObject({ id: 1 });
    expect(prismaMock.author.create).toHaveBeenCalledWith({
      data: { name: "George Orwell", bio: null },
    });
  });

  it("não deve excluir autor com livros vinculados", async () => {
    prismaMock.author.findUnique.mockResolvedValue({ id: 1, name: "Machado", bio: null, books: [{ id: 1 }] });
    await expect(authorService.remove(1)).rejects.toMatchObject<ApiError>({
      status: 409,
      message: "Não é possível excluir o autor porque há livros vinculados.",
    });
    expect(prismaMock.author.delete).not.toHaveBeenCalled();
  });

  it("exclui autor sem livros vinculados", async () => {
    prismaMock.author.findUnique.mockResolvedValue({ id: 2, name: "Sem livros", bio: null, books: [] });
    prismaMock.author.delete.mockResolvedValue({ id: 2, name: "Sem livros" });
    await expect(authorService.remove(2)).resolves.toMatchObject({ id: 2 });
    expect(prismaMock.author.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });
});
