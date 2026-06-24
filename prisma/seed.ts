import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tecnologia = await prisma.category.upsert({
    where: { name: "Tecnologia" },
    update: {},
    create: { name: "Tecnologia" },
  });
  const literatura = await prisma.category.upsert({
    where: { name: "Literatura" },
    update: {},
    create: { name: "Literatura" },
  });

  const martin = await prisma.author.upsert({
    where: { name: "Martin Kleppmann" },
    update: {},
    create: { name: "Martin Kleppmann", biography: "Pesquisador de sistemas distribuídos." },
  });
  const machado = await prisma.author.upsert({
    where: { name: "Machado de Assis" },
    update: {},
    create: { name: "Machado de Assis", biography: "Escritor brasileiro." },
  });

  await prisma.book.upsert({
    where: { isbn: "9781449373320" },
    update: {},
    create: {
      title: "Designing Data-Intensive Applications",
      isbn: "9781449373320",
      categoryId: tecnologia.id,
      authors: { connect: [{ id: martin.id }] },
    },
  });
  await prisma.book.upsert({
    where: { isbn: "9788572326972" },
    update: {},
    create: {
      title: "Dom Casmurro",
      isbn: "9788572326972",
      categoryId: literatura.id,
      authors: { connect: [{ id: machado.id }] },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
