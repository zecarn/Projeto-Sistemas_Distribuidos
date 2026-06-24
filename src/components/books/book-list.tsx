import type { Book } from "./types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

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
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Ano</th>
            <th>Categorias</th>
            <th>Status</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                <p className="font-bold text-emerald-950">{book.title}</p>
                {book.description && <p className="mt-1 max-w-xs text-xs text-black/55">{book.description}</p>}
              </td>
              <td className="text-black/70">{book.author.name}</td>
              <td className="text-black/70">{book.publishedYear ?? "—"}</td>
              <td className="text-black/70">{book.categories.map(({ category }) => category.name).join(", ") || "—"}</td>
              <td>
                <button onClick={() => onToggleAvailable(book)} className="cursor-pointer">
                  <Badge tone={book.available ? "success" : "neutral"}>
                    {book.available ? "Disponível" : "Emprestado"}
                  </Badge>
                </button>
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onEdit(book)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(book.id)}>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
