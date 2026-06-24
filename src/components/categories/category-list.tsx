import type { Category } from "./types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

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
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Livros</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="font-bold text-emerald-950">{category.name}</td>
              <td>
                <Badge tone="warning">
                  {category._count.books} livro{category._count.books === 1 ? "" : "s"}
                </Badge>
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onEdit(category)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(category.id)}>
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
