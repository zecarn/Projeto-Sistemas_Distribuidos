import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BookSeed = {
  title: string;
  author: string;
  publishedYear: number;
  categories: string[];
};

const catalog: BookSeed[] = [
  { title: "Dom Casmurro", author: "Machado de Assis", publishedYear: 1899, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", publishedYear: 1881, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Quincas Borba", author: "Machado de Assis", publishedYear: 1891, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "O Alienista", author: "Machado de Assis", publishedYear: 1882, categories: ["Ficção", "Clássico", "Literatura Brasileira"] },
  { title: "Iracema", author: "José de Alencar", publishedYear: 1865, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "O Cortiço", author: "Aluísio Azevedo", publishedYear: 1890, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Capitães da Areia", author: "Jorge Amado", publishedYear: 1937, categories: ["Romance", "Literatura Brasileira"] },
  { title: "Grande Sertão: Veredas", author: "João Guimarães Rosa", publishedYear: 1956, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Vidas Secas", author: "Graciliano Ramos", publishedYear: 1938, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "A Hora da Estrela", author: "Clarice Lispector", publishedYear: 1977, categories: ["Romance", "Literatura Brasileira"] },
  { title: "O Auto da Compadecida", author: "Ariano Suassuna", publishedYear: 1955, categories: ["Drama", "Clássico", "Literatura Brasileira"] },
  { title: "Macunaíma", author: "Mário de Andrade", publishedYear: 1928, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Triste Fim de Policarpo Quaresma", author: "Lima Barreto", publishedYear: 1915, categories: ["Romance", "Clássico", "Literatura Brasileira"] },
  { title: "Reinações de Narizinho", author: "Monteiro Lobato", publishedYear: 1931, categories: ["Fantasia", "Infantil", "Literatura Brasileira"] },
  { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", publishedYear: 1943, categories: ["Fantasia", "Clássico", "Infantil"] },
  { title: "O Hobbit", author: "J.R.R. Tolkien", publishedYear: 1937, categories: ["Fantasia", "Aventura", "Clássico"] },
  { title: "A Sociedade do Anel", author: "J.R.R. Tolkien", publishedYear: 1954, categories: ["Fantasia", "Aventura"] },
  { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", publishedYear: 1997, categories: ["Fantasia", "Ficção", "Aventura"] },
  { title: "Harry Potter e a Câmara Secreta", author: "J.K. Rowling", publishedYear: 1998, categories: ["Fantasia", "Ficção", "Aventura"] },
  { title: "Harry Potter e o Prisioneiro de Azkaban", author: "J.K. Rowling", publishedYear: 1999, categories: ["Fantasia", "Ficção", "Aventura"] },
  { title: "O Leão, a Feiticeira e o Guarda-Roupa", author: "C.S. Lewis", publishedYear: 1950, categories: ["Fantasia", "Aventura", "Infantil"] },
  { title: "Alice no País das Maravilhas", author: "Lewis Carroll", publishedYear: 1865, categories: ["Fantasia", "Clássico", "Infantil"] },
  { title: "Peter Pan", author: "J.M. Barrie", publishedYear: 1911, categories: ["Fantasia", "Aventura", "Infantil"] },
  { title: "Frankenstein", author: "Mary Shelley", publishedYear: 1818, categories: ["Terror", "Ficção Científica", "Clássico"] },
  { title: "Drácula", author: "Bram Stoker", publishedYear: 1897, categories: ["Terror", "Clássico"] },
  { title: "O Retrato de Dorian Gray", author: "Oscar Wilde", publishedYear: 1890, categories: ["Romance", "Terror", "Clássico"] },
  { title: "Orgulho e Preconceito", author: "Jane Austen", publishedYear: 1813, categories: ["Romance", "Clássico"] },
  { title: "Jane Eyre", author: "Charlotte Brontë", publishedYear: 1847, categories: ["Romance", "Clássico"] },
  { title: "O Morro dos Ventos Uivantes", author: "Emily Brontë", publishedYear: 1847, categories: ["Romance", "Clássico"] },
  { title: "Crime e Castigo", author: "Fiódor Dostoiévski", publishedYear: 1866, categories: ["Romance", "Clássico"] },
  { title: "Os Irmãos Karamázov", author: "Fiódor Dostoiévski", publishedYear: 1880, categories: ["Romance", "Clássico"] },
  { title: "Guerra e Paz", author: "Liev Tolstói", publishedYear: 1869, categories: ["Romance", "História", "Clássico"] },
  { title: "Anna Kariênina", author: "Liev Tolstói", publishedYear: 1878, categories: ["Romance", "Clássico"] },
  { title: "Os Miseráveis", author: "Victor Hugo", publishedYear: 1862, categories: ["Romance", "História", "Clássico"] },
  { title: "O Conde de Monte Cristo", author: "Alexandre Dumas", publishedYear: 1844, categories: ["Romance", "Aventura", "Clássico"] },
  { title: "Madame Bovary", author: "Gustave Flaubert", publishedYear: 1857, categories: ["Romance", "Clássico"] },
  { title: "Dom Quixote", author: "Miguel de Cervantes", publishedYear: 1605, categories: ["Romance", "Aventura", "Clássico"] },
  { title: "A Odisseia", author: "Homero", publishedYear: -700, categories: ["Poesia", "Aventura", "Clássico"] },
  { title: "A Ilíada", author: "Homero", publishedYear: -750, categories: ["Poesia", "História", "Clássico"] },
  { title: "1984", author: "George Orwell", publishedYear: 1949, categories: ["Ficção", "Distopia", "Clássico"] },
  { title: "A Revolução dos Bichos", author: "George Orwell", publishedYear: 1945, categories: ["Ficção", "Distopia", "Clássico"] },
  { title: "Admirável Mundo Novo", author: "Aldous Huxley", publishedYear: 1932, categories: ["Ficção Científica", "Distopia", "Clássico"] },
  { title: "Fahrenheit 451", author: "Ray Bradbury", publishedYear: 1953, categories: ["Ficção Científica", "Distopia", "Clássico"] },
  { title: "O Conto da Aia", author: "Margaret Atwood", publishedYear: 1985, categories: ["Ficção", "Distopia"] },
  { title: "Duna", author: "Frank Herbert", publishedYear: 1965, categories: ["Ficção Científica", "Aventura", "Clássico"] },
  { title: "Fundação", author: "Isaac Asimov", publishedYear: 1951, categories: ["Ficção Científica", "Clássico"] },
  { title: "O Guia do Mochileiro das Galáxias", author: "Douglas Adams", publishedYear: 1979, categories: ["Ficção Científica", "Aventura"] },
  { title: "Neuromancer", author: "William Gibson", publishedYear: 1984, categories: ["Ficção Científica"] },
  { title: "A Mão Esquerda da Escuridão", author: "Ursula K. Le Guin", publishedYear: 1969, categories: ["Ficção Científica"] },
  { title: "Solaris", author: "Stanisław Lem", publishedYear: 1961, categories: ["Ficção Científica"] },
  { title: "Assassinato no Expresso do Oriente", author: "Agatha Christie", publishedYear: 1934, categories: ["Mistério", "Clássico"] },
  { title: "E Não Sobrou Nenhum", author: "Agatha Christie", publishedYear: 1939, categories: ["Mistério", "Clássico"] },
  { title: "Um Estudo em Vermelho", author: "Arthur Conan Doyle", publishedYear: 1887, categories: ["Mistério", "Clássico"] },
  { title: "O Iluminado", author: "Stephen King", publishedYear: 1977, categories: ["Terror"] },
  { title: "It: A Coisa", author: "Stephen King", publishedYear: 1986, categories: ["Terror"] },
  { title: "O Nome da Rosa", author: "Umberto Eco", publishedYear: 1980, categories: ["Mistério", "História"] },
  { title: "Sapiens: Uma Breve História da Humanidade", author: "Yuval Noah Harari", publishedYear: 2011, categories: ["História", "Não Ficção"] },
  { title: "Uma Breve História do Tempo", author: "Stephen Hawking", publishedYear: 1988, categories: ["Ciência", "Não Ficção"] },
  { title: "Cosmos", author: "Carl Sagan", publishedYear: 1980, categories: ["Ciência", "Não Ficção"] },
  { title: "Clean Code", author: "Robert C. Martin", publishedYear: 2008, categories: ["Tecnologia", "Não Ficção"] },
];

async function findOrCreateAuthor(name: string) {
  const existing = await prisma.author.findFirst({ where: { name } });
  return existing ?? prisma.author.create({ data: { name } });
}

async function upsertBook(book: BookSeed, authorId: number, categoryIds: number[]) {
  const existing = await prisma.book.findFirst({ where: { title: book.title } });
  const data = {
    description: `${book.title}, obra de ${book.author}.`,
    publishedYear: book.publishedYear,
    available: true,
    authorId,
    categories: {
      deleteMany: {},
      create: categoryIds.map((categoryId) => ({ categoryId })),
    },
  };

  if (existing) return prisma.book.update({ where: { id: existing.id }, data });
  return prisma.book.create({
    data: {
      title: book.title,
      description: data.description,
      publishedYear: data.publishedYear,
      available: data.available,
      authorId: data.authorId,
      categories: { create: data.categories.create },
    },
  });
}

async function main() {
  const categoryNames = [...new Set(catalog.flatMap((book) => book.categories))];
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name } })),
  );
  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));

  const authorNames = [...new Set(catalog.map((book) => book.author))];
  const authors = await Promise.all(authorNames.map(findOrCreateAuthor));
  const authorByName = new Map(authors.map((author) => [author.name, author.id]));

  for (const book of catalog) {
    const authorId = authorByName.get(book.author);
    const categoryIds = book.categories.map((name) => categoryByName.get(name));
    if (!authorId || categoryIds.some((id) => id === undefined)) throw new Error(`Dados inválidos para ${book.title}.`);
    await upsertBook(book, authorId, categoryIds as number[]);
  }

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

  console.log(`Seed concluído: ${catalog.length} livros reais cadastrados ou atualizados.`);
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
