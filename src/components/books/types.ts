export type Author = { id: number; name: string };
export type Category = { id: number; name: string };
export type BookCategory = { category: Category };
export type Book = {
  id: number;
  title: string;
  description: string | null;
  publishedYear: number | null;
  available: boolean;
  author: Author;
  categories: BookCategory[];
};
