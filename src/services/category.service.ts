import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/AppError";
import { categorySchema, validate } from "@/lib/validations";

const data = (input: Record<string, unknown>) => validate(categorySchema, input);

export const categoryService = {
  list: () => prisma.category.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: "asc" },
  }),
  async get(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { books: { include: { book: true } } },
    });
    if (!category) throw new AppError("Categoria não encontrada.", 404);
    return category;
  },
  async create(input: Record<string, unknown>) {
    const payload = data(input);
    const existing = await prisma.category.findUnique({ where: { name: payload.name } });
    if (existing) throw new AppError("Já existe uma categoria com esse nome.", 409);
    return prisma.category.create({ data: payload });
  },
  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    const payload = data(input);
    const duplicate = await prisma.category.findFirst({
      where: { name: payload.name, NOT: { id } },
    });
    if (duplicate) throw new AppError("Já existe uma categoria com esse nome.", 409);
    return prisma.category.update({ where: { id }, data: payload });
  },
  async remove(id: number) {
    await this.get(id);
    const [, category] = await prisma.$transaction([
      prisma.bookCategory.deleteMany({ where: { categoryId: id } }),
      prisma.category.delete({ where: { id } }),
    ]);
    return category;
  },
};
