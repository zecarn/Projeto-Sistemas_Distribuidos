import type { User } from "./types";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

type UserListProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return <div className="card text-black/55">Nenhum usuário cadastrado.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Empréstimos</th>
            <th>Cadastro</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="font-bold text-emerald-950">{user.name}</td>
              <td className="text-black/70">{user.email}</td>
              <td>
                <Badge tone="success">
                  {user._count.loans} empréstimo{user._count.loans === 1 ? "" : "s"}
                </Badge>
              </td>
              <td className="text-black/70">{formatDate(user.createdAt)}</td>
              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => onEdit(user)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(user.id)}>
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
