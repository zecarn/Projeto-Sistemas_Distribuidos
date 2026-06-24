import type { Category } from "./types";

type CategoryCardProps = {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <article className="card flex items-center justify-between gap-4">
      <div>
        <h2 className="font-bold text-emerald-950">{category.name}</h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          {category._count.books} livro{category._count.books === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onEdit(category)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          Editar
        </button>
        <button onClick={() => onDelete(category.id)} className="button-danger">
          Excluir
        </button>
      </div>
    </article>
  );
}
