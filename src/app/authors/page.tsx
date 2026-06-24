"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { AuthorForm } from "@/components/authors/author-form";
import { AuthorList } from "@/components/authors/author-list";
import type { Author } from "@/components/authors/types";
import { api } from "@/services/api-client";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<Author[]>("/api/authors");
      setAuthors(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(data: { name: string; bio: string }) {
    setSaving(true);
    setError("");
    const payload = { name: data.name, bio: data.bio || null };
    try {
      if (editing) {
        await api(`/api/authors/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setEditing(null);
      } else {
        await api("/api/authors", { method: "POST", body: JSON.stringify(payload) });
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
    try {
      await api(`/api/authors/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeading eyebrow="Pessoas" title="Autores" description="Mantenha os autores que compõem o acervo da biblioteca." />
      <Feedback error={error} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <AuthorForm editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>
          <AuthorList authors={authors} onEdit={setEditing} onDelete={remove} />
        </section>
      </div>
    </>
  );
}
