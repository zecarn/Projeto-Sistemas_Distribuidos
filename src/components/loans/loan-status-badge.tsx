import type { LoanStatus } from "./types";

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        isActive ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
      }`}
    >
      {isActive ? "Em andamento" : "Devolvido"}
    </span>
  );
}
