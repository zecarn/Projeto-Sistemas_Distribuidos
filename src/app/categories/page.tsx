import { PageHeading } from "@/components/page-heading";
import { SimpleManager } from "@/components/simple-manager";

export default function CategoriesPage() {
  return <><PageHeading eyebrow="Organização" title="Categorias" description="Agrupe os livros por tema para facilitar a descoberta." /><SimpleManager endpoint="categories" noun="categoria" /></>;
}
