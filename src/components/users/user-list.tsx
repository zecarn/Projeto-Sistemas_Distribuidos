import type { User } from "./types";
import { UserCard } from "./user-card";

type UserListProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
};

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return <div className="card text-black/55">Nenhum usuário cadastrado.</div>;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
