import type { Author } from "./types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

type AuthorListProps = {
  authors: Author[];
  onEdit: (author: Author) => void;
  onDelete: (id: number) => void;
};

export function AuthorList({ authors, onEdit, onDelete }: AuthorListProps) {
  if (authors.length === 0) {
    return <div className="card text-black/55">Nenhum autor cadastrado.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Biografia</th>
            <th>Livros</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((author) => (
            <tr key={author.id}>
              <td className="font-bold text-emerald-950">{author.name}</td>
              <td className="max-w-sm text-black/65">{author.bio ?? "—"}</td>
              <td>
                <Badge tone="warning">{author._count.books} livro{author._count.books === 1 ? "" : "s"}</Badge>
                {author.books.length > 0 && (
                  <p className="mt-1 max-w-xs text-xs text-black/55">{author.books.map((b) => b.title).join(", ")}</p>
                )}
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onEdit(author)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(author.id)}>
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
