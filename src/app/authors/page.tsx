"use client";

import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { AuthorForm } from "@/components/authors/author-form";
import { AuthorList } from "@/components/authors/author-list";
import type { Author } from "@/components/authors/types";
import { api } from "@/services/api-client";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<Author[]>("/api/authors");
      setAuthors(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(data: { name: string; bio: string }) {
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = { name: data.name, bio: data.bio || null };
    try {
      if (editing) {
        await api(`/api/authors/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setEditing(null);
        setSuccess("Autor atualizado com sucesso.");
      } else {
        await api("/api/authors", { method: "POST", body: JSON.stringify(payload) });
        setSuccess("Autor cadastrado com sucesso.");
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover este autor?")) return;
    setError("");
    setSuccess("");
    try {
      await api(`/api/authors/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      setSuccess("Autor excluído com sucesso.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle eyebrow="Pessoas" title="Autores" description="Mantenha os autores que compõem o acervo da biblioteca." />
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <AuthorForm editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>{loading ? <Loading label="Carregando autores…" /> : <AuthorList authors={authors} onEdit={setEditing} onDelete={remove} />}</section>
      </div>
    </>
  );
}
