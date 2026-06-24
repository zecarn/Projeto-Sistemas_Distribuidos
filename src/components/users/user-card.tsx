import type { User } from "./types";

type UserCardProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <article className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold text-emerald-950">{user.name}</h2>
        <p className="mt-1 text-sm text-black/55">
          {user.email} · Cadastrado em {formatDate(user.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {user._count.loans} empréstimo{user._count.loans === 1 ? "" : "s"}
        </span>
        <button
          onClick={() => onEdit(user)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          Editar
        </button>
        <button onClick={() => onDelete(user.id)} className="button-danger">
          Excluir
        </button>
      </div>
    </article>
  );
}
