import type { Loan } from "./types";
import { LoanStatusBadge } from "./loan-status-badge";
import { Button } from "@/components/Button";

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
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Livro</th>
            <th>Empréstimo</th>
            <th>Devolução</th>
            <th>Status</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td className="font-bold text-emerald-950">{loan.user.name}</td>
              <td className="text-black/70">{loan.book.title}</td>
              <td className="text-black/70">{formatDate(loan.loanDate)}</td>
              <td className="text-black/70">{formatDate(loan.returnDate)}</td>
              <td>
                <LoanStatusBadge status={loan.status} />
              </td>
              <td className="text-right">
                {loan.status === "ACTIVE" ? (
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onReturn(loan.id)}>
                    Devolver
                  </Button>
                ) : (
                  <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(loan.id)}>
                    Excluir
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
