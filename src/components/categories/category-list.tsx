import type { Category } from "./types";
import { CategoryCard } from "./category-card";

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
};

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return <div className="card text-black/55">Nenhuma categoria cadastrada.</div>;
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
