"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryList } from "@/components/categories/category-list";
import type { Category } from "@/components/categories/types";
import { api } from "@/services/api-client";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<Category[]>("/api/categories");
      setCategories(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(data: { name: string }) {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api(`/api/categories/${editing.id}`, { method: "PUT", body: JSON.stringify(data) });
        setEditing(null);
      } else {
        await api("/api/categories", { method: "POST", body: JSON.stringify(data) });
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
    try {
      await api(`/api/categories/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageHeading eyebrow="Organização" title="Categorias" description="Agrupe os livros por tema para facilitar a descoberta." />
      <Feedback error={error} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <CategoryForm editing={editing} saving={saving} onSubmit={submit} onCancelEdit={() => setEditing(null)} />
        <section>
          <CategoryList categories={categories} onEdit={setEditing} onDelete={remove} />
        </section>
      </div>
    </>
  );
}
