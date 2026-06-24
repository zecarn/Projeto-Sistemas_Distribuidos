import { prisma } from "@/lib/prisma";
import { ApiError, requiredString } from "@/lib/api";

function data(input: Record<string, unknown>) {
  return {
    name: requiredString(input.name, "name"),
    bio: typeof input.bio === "string" && input.bio.trim() ? input.bio.trim() : null,
  };
}

export const authorService = {
  list: () => prisma.author.findMany({
    include: { books: true, _count: { select: { books: true } } },
    orderBy: { name: "asc" },
  }),
  async get(id: number) {
    const author = await prisma.author.findUnique({ where: { id }, include: { books: true } });
    if (!author) throw new ApiError(404, "Autor não encontrado.");
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
      throw new ApiError(409, "Não é possível excluir o autor porque há livros vinculados.");
    }
    return prisma.author.delete({ where: { id } });
  },
};
