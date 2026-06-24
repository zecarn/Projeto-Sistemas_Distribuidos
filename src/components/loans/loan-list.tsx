import type { Loan } from "./types";
import { LoanStatusBadge } from "./loan-status-badge";

type LoanListProps = {
  loans: Loan[];
  onReturn: (id: number) => void;
  onDelete: (id: number) => void;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export function LoanList({ loans, onReturn, onDelete }: LoanListProps) {
  if (loans.length === 0) {
    return <div className="card text-black/55">Nenhum empréstimo encontrado.</div>;
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => (
        <article key={loan.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-emerald-950">{loan.book.title}</h2>
            <p className="mt-1 text-sm text-black/55">
              {loan.user.name} · Empréstimo em {formatDate(loan.loanDate)}
              {loan.returnDate ? ` · Devolução em ${formatDate(loan.returnDate)}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <LoanStatusBadge status={loan.status} />
            {loan.status === "ACTIVE" ? (
              <button
                onClick={() => onReturn(loan.id)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
              >
                Devolver
              </button>
            ) : (
              <button onClick={() => onDelete(loan.id)} className="button-danger">
                Excluir
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
