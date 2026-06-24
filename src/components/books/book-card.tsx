import type { Book } from "./types";

type BookCardProps = {
  book: Book;
  onEdit: (book: Book) => void;
  onToggleAvailable: (book: Book) => void;
  onDelete: (id: number) => void;
};

export function BookCard({ book, onEdit, onToggleAvailable, onDelete }: BookCardProps) {
  return (
    <article className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold text-emerald-950">{book.title}</h2>
        <p className="mt-1 text-sm text-black/55">
          {book.author.name} · {book.categories.map(({ category }) => category.name).join(", ")}
          {book.publishedYear ? ` · ${book.publishedYear}` : ""}
        </p>
        {book.description && <p className="mt-2 text-sm text-black/65">{book.description}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          onClick={() => onToggleAvailable(book)}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            book.available ? "bg-emerald-100 text-emerald-800" : "bg-black/5 text-black/55"
          }`}
        >
          {book.available ? "Disponível" : "Emprestado"}
        </button>
        <button
          onClick={() => onEdit(book)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          Editar
        </button>
        <button onClick={() => onDelete(book.id)} className="button-danger">
          Excluir
        </button>
      </div>
    </article>
  );
}
