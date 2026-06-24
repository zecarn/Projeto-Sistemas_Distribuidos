"use client";

import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { UserForm } from "@/components/users/user-form";
import { UserList } from "@/components/users/user-list";
import type { User } from "@/components/users/types";
import { api } from "@/services/api-client";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<User[]>("/api/users");
      setUsers(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function submit(data: { name: string; email: string }) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await api(`/api/users/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
        setEditing(null);
        setSuccess("Usuário atualizado com sucesso.");
      } else {
        await api("/api/users", { method: "POST", body: JSON.stringify(data) });
        setSuccess("Usuário cadastrado com sucesso.");
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
    setError("");
    setSuccess("");
    try {
      await api(`/api/users/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      setSuccess("Usuário excluído com sucesso.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="Comunidade"
        title="Usuários"
        description="Cadastre leitores e acompanhe a quantidade de empréstimos de cada um."
      />
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <UserForm key={editing?.id ?? "new"} editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>{loading ? <Loading label="Carregando usuários…" /> : <UserList users={users} onEdit={setEditing} onDelete={remove} />}</section>
      </div>
    </>
  );
}
