import type { Author } from "./types";

type AuthorCardProps = {
  author: Author;
  onEdit: (author: Author) => void;
  onDelete: (id: number) => void;
};

export function AuthorCard({ author, onEdit, onDelete }: AuthorCardProps) {
  return (
    <article className="card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-bold text-emerald-950">{author.name}</h2>
        {author.bio && <p className="mt-1 text-sm text-black/65">{author.bio}</p>}
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
          {author._count.books} livro{author._count.books === 1 ? "" : "s"}
        </p>
        {author.books.length > 0 && (
          <p className="mt-1 text-sm text-black/55">{author.books.map((b) => b.title).join(", ")}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onEdit(author)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          Editar
        </button>
        <button onClick={() => onDelete(author.id)} className="button-danger">
          Excluir
        </button>
      </div>
    </article>
  );
}
