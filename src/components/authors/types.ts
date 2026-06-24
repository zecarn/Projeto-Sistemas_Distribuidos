export type AuthorBook = { id: number; title: string };
export type Author = {
  id: number;
  name: string;
  bio: string | null;
  books: AuthorBook[];
  _count: { books: number };
};
