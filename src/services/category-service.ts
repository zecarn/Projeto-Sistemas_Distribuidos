import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

const data = (input: Record<string, unknown>) => ({ name: requiredString(input.name, "name") });

export const categoryService = {
  list: () => prisma.category.findMany({ include: { _count: { select: { books: true } } }, orderBy: { name: "asc" } }),
  async get(id: number) {
    const category = await prisma.category.findUnique({ where: { id }, include: { books: true } });
    if (!category) throw new ApiError(404, "Categoria não encontrada.");
    return category;
  },
  create: (input: Record<string, unknown>) => prisma.category.create({ data: data(input) }),
  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    return prisma.category.update({ where: { id }, data: data(input) });
  },
  async remove(id: number) {
    await this.get(id);
    return prisma.category.delete({ where: { id } });
  },
};
