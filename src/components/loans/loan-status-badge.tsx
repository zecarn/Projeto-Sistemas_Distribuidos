import { Badge } from "@/components/Badge";
import type { LoanStatus } from "./types";

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const isActive = status === "ACTIVE";
  return <Badge tone={isActive ? "warning" : "success"}>{isActive ? "Em andamento" : "Devolvido"}</Badge>;
}
