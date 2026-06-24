import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findOrCreateAuthor(name: string, bio: string) {
  const existing = await prisma.author.findFirst({ where: { name } });
  return existing ?? prisma.author.create({ data: { name, bio } });
}

async function main() {
  const tecnologia = await prisma.category.upsert({
    where: { name: "Tecnologia" }, update: {}, create: { name: "Tecnologia" },
  });
  const literatura = await prisma.category.upsert({
    where: { name: "Literatura" }, update: {}, create: { name: "Literatura" },
  });
  const martin = await findOrCreateAuthor("Martin Kleppmann", "Pesquisador de sistemas distribuídos.");
  const machado = await findOrCreateAuthor("Machado de Assis", "Escritor brasileiro.");

  if (!(await prisma.book.findFirst({ where: { title: "Designing Data-Intensive Applications" } }))) {
    await prisma.book.create({
      data: {
        title: "Designing Data-Intensive Applications", publishedYear: 2017,
        description: "Fundamentos de sistemas de dados confiáveis e escaláveis.", authorId: martin.id,
        categories: { create: [{ categoryId: tecnologia.id }] },
      },
    });
  }
  if (!(await prisma.book.findFirst({ where: { title: "Dom Casmurro" } }))) {
    await prisma.book.create({
      data: {
        title: "Dom Casmurro", publishedYear: 1899, description: "Romance clássico da literatura brasileira.",
        authorId: machado.id, categories: { create: [{ categoryId: literatura.id }] },
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
