"use client";

import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryList } from "@/components/categories/category-list";
import type { Category } from "@/components/categories/types";
import { api } from "@/services/api-client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<Category[]>("/api/categories");
      setCategories(data);
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

  async function submit(data: { name: string }) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await api(`/api/categories/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
        setEditing(null);
        setSuccess("Categoria atualizada com sucesso.");
      } else {
        await api("/api/categories", { method: "POST", body: JSON.stringify(data) });
        setSuccess("Categoria cadastrada com sucesso.");
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover esta categoria?")) return;
    setError("");
    setSuccess("");
    try {
      await api(`/api/categories/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      setSuccess("Categoria excluída com sucesso.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle eyebrow="Organização" title="Categorias" description="Agrupe os livros por tema para facilitar a descoberta." />
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <CategoryForm editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>{loading ? <Loading label="Carregando categorias…" /> : <CategoryList categories={categories} onEdit={setEditing} onDelete={remove} />}</section>
      </div>
    </>
  );
}
