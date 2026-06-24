import type { Author } from "./types";
import { AuthorCard } from "./author-card";

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
    <div className="space-y-3">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
