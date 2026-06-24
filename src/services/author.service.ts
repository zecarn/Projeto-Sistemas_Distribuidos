import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/AppError";
import { authorSchema, validate } from "@/lib/validations";

const data = (input: Record<string, unknown>) => validate(authorSchema, input);

export const authorService = {
  list: () => prisma.author.findMany({
    include: { books: true, _count: { select: { books: true } } },
    orderBy: { name: "asc" },
  }),
  async get(id: number) {
    const author = await prisma.author.findUnique({ where: { id }, include: { books: true } });
    if (!author) throw new AppError("Autor não encontrado.", 404);
    return author;
  },
  create: (input: Record<string, unknown>) => prisma.author.create({ data: data(input) }),
  async update(id: number, input: Record<string, unknown>) {
    await this.get(id);
    return prisma.author.update({ where: { id }, data: data(input) });
  },
  async remove(id: number) {
    const author = await this.get(id);
    if (author.books.length > 0) {
      throw new AppError("Não é possível excluir o autor porque há livros vinculados.", 409);
    }
    return prisma.author.delete({ where: { id } });
  },
};
