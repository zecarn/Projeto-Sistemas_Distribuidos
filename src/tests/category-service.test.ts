import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: {
      findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(),
      create: vi.fn(), update: vi.fn(), delete: vi.fn(),
    },
    bookCategory: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { categoryService } from "@/services/category-service";

describe("categoryService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista categorias com a quantidade de livros", async () => {
    prismaMock.category.findMany.mockResolvedValue([]);
    await categoryService.list();
    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      include: { _count: { select: { books: true } } }, orderBy: { name: "asc" },
    });
  });

  it("valida o nome antes de criar", async () => {
    await expect(categoryService.create({})).rejects.toThrowError("name é obrigatório.");
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("impede nomes duplicados", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1, name: "Romance" });
    await expect(categoryService.create({ name: "Romance" })).rejects.toMatchObject({
      status: 409, message: "Já existe uma categoria com esse nome.",
    });
  });

  it("busca a categoria incluindo os livros relacionados", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1, name: "Romance", books: [] });
    await categoryService.get(1);
    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }, include: { books: { include: { book: true } } },
    });
  });

  it("remove os vínculos antes da categoria em uma transação", async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 1, name: "Romance", books: [] });
    prismaMock.bookCategory.deleteMany.mockReturnValue("remove-links");
    prismaMock.category.delete.mockReturnValue("remove-category");
    prismaMock.$transaction.mockResolvedValue([{ count: 2 }, { id: 1, name: "Romance" }]);
    await expect(categoryService.remove(1)).resolves.toMatchObject({ id: 1 });
    expect(prismaMock.$transaction).toHaveBeenCalledWith(["remove-links", "remove-category"]);
  });
});
