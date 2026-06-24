import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertAuthor(name: string, bio: string) {
  const existing = await prisma.author.findFirst({ where: { name } });
  if (existing) return prisma.author.update({ where: { id: existing.id }, data: { bio } });
  return prisma.author.create({ data: { name, bio } });
}

async function upsertBook(input: {
  title: string;
  description: string;
  publishedYear: number;
  authorId: number;
  categoryIds: number[];
}) {
  const existing = await prisma.book.findFirst({ where: { title: input.title } });
  const scalarData = {
    description: input.description,
    publishedYear: input.publishedYear,
    available: true,
    authorId: input.authorId,
  };

  if (existing) {
    return prisma.book.update({
      where: { id: existing.id },
      data: {
        ...scalarData,
        categories: {
          deleteMany: {},
          create: input.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });
  }
  return prisma.book.create({
    data: {
      title: input.title,
      ...scalarData,
      categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) },
    },
  });
}

async function main() {
  const [romance, fantasia, ficcao, classico, literaturaBrasileira] = await Promise.all(
    ["Romance", "Fantasia", "Ficção", "Clássico", "Literatura Brasileira"].map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  const [machado, rowling, orwell] = await Promise.all([
    upsertAuthor("Machado de Assis", "Escritor brasileiro e fundador da Academia Brasileira de Letras."),
    upsertAuthor("J.K. Rowling", "Escritora britânica, autora da série Harry Potter."),
    upsertAuthor("George Orwell", "Escritor e jornalista britânico."),
  ]);

  await upsertBook({
    title: "Dom Casmurro",
    description: "Romance narrado por Bento Santiago sobre memória, amor e ciúme.",
    publishedYear: 1899,
    authorId: machado.id,
    categoryIds: [romance.id, classico.id, literaturaBrasileira.id],
  });
  await upsertBook({
    title: "Memórias Póstumas de Brás Cubas",
    description: "Um defunto autor revisita sua vida com ironia e crítica social.",
    publishedYear: 1881,
    authorId: machado.id,
    categoryIds: [romance.id, classico.id, literaturaBrasileira.id],
  });
  await upsertBook({
    title: "Harry Potter e a Pedra Filosofal",
    description: "Um jovem bruxo descobre seu passado e inicia os estudos em Hogwarts.",
    publishedYear: 1997,
    authorId: rowling.id,
    categoryIds: [fantasia.id, ficcao.id],
  });
  await upsertBook({
    title: "1984",
    description: "Distopia sobre vigilância, autoritarismo e controle da verdade.",
    publishedYear: 1949,
    authorId: orwell.id,
    categoryIds: [ficcao.id, classico.id],
  });

  await Promise.all([
    prisma.user.upsert({
      where: { email: "joao.silva@biblioteca.local" }, update: { name: "João Silva" },
      create: { name: "João Silva", email: "joao.silva@biblioteca.local" },
    }),
    prisma.user.upsert({
      where: { email: "maria.oliveira@biblioteca.local" }, update: { name: "Maria Oliveira" },
      create: { name: "Maria Oliveira", email: "maria.oliveira@biblioteca.local" },
    }),
    prisma.user.upsert({
      where: { email: "ana.santos@biblioteca.local" }, update: { name: "Ana Santos" },
      create: { name: "Ana Santos", email: "ana.santos@biblioteca.local" },
    }),
  ]);

  console.log("Seed concluído: autores, categorias, livros e usuários cadastrados.");
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
