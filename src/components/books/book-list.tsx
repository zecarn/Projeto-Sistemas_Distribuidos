import type { Book } from "./types";
import { BookCard } from "./book-card";

type BookListProps = {
  books: Book[];
  onEdit: (book: Book) => void;
  onToggleAvailable: (book: Book) => void;
  onDelete: (id: number) => void;
};

export function BookList({ books, onEdit, onToggleAvailable, onDelete }: BookListProps) {
  if (books.length === 0) {
    return <div className="card text-black/55">Nenhum livro encontrado.</div>;
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onEdit={onEdit} onToggleAvailable={onToggleAvailable} onDelete={onDelete} />
      ))}
    </div>
  );
}
