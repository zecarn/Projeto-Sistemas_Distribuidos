import { PageHeading } from "@/components/page-heading";
import { SimpleManager } from "@/components/simple-manager";

export default function AuthorsPage() {
  return <><PageHeading eyebrow="Pessoas" title="Autores" description="Mantenha os autores que compõem o acervo da biblioteca." /><SimpleManager endpoint="authors" noun="autor" withBiography /></>;
}
