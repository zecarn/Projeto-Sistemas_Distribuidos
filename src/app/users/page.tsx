"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { UserForm } from "@/components/users/user-form";
import { UserList } from "@/components/users/user-list";
import type { User } from "@/components/users/types";
import { api } from "@/services/api-client";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<User[]>("/api/users");
      setUsers(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(data: { name: string; email: string }) {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api(`/api/users/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
        setEditing(null);
      } else {
        await api("/api/users", { method: "POST", body: JSON.stringify(data) });
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover este usuário?")) return;
    try {
      await api(`/api/users/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Comunidade"
        title="Usuários"
        description="Cadastre leitores e acompanhe a quantidade de empréstimos de cada um."
      />
      <Feedback error={error} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <UserForm editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>
          <UserList users={users} onEdit={setEditing} onDelete={remove} />
        </section>
      </div>
    </>
  );
}
