"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Author, Book, Category } from "./types";

type BookFormProps = {
  authors: Author[];
  categories: Category[];
  editing: Book | null;
  saving: boolean;
  onSubmit: (data: {
    title: string;
    description: string;
    publishedYear: string;
    authorId: number;
    categoryIds: number[];
    available?: boolean;
  }) => Promise<void>;
  onCancelEdit: () => void;
};

export function BookForm({ authors, categories, editing, saving, onSubmit, onCancelEdit }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    setTitle(editing?.title ?? "");
    setDescription(editing?.description ?? "");
    setPublishedYear(editing?.publishedYear ? String(editing.publishedYear) : "");
    setAuthorId(editing ? String(editing.author.id) : "");
    setCategoryIds(editing ? editing.categories.map(({ category }) => String(category.id)) : []);
  }, [editing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      title,
      description,
      publishedYear,
      authorId: Number(authorId),
      categoryIds: categoryIds.map(Number),
      available: editing?.available,
    });
    if (!editing) {
      setTitle("");
      setDescription("");
      setPublishedYear("");
      setAuthorId("");
      setCategoryIds([]);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card h-fit space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? "Editar livro" : "Novo livro"}</h2>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-xs font-semibold text-black/50 hover:underline">
            Cancelar
          </button>
        )}
      </div>
      <label className="block text-sm font-medium">
        Título
        <input className="field mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="block text-sm font-medium">
        Descrição
        <textarea
          className="field mt-1 min-h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Ano de publicação
        <input
          className="field mt-1"
          type="number"
          min="0"
          max="9999"
          value={publishedYear}
          onChange={(e) => setPublishedYear(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium">
        Autor
        <select className="field mt-1" value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
          <option value="">Selecione</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Categorias <span className="font-normal text-black/45">(Ctrl para várias)</span>
        <select
          className="field mt-1 min-h-28"
          multiple
          value={categoryIds}
          onChange={(e) => setCategoryIds(Array.from(e.target.selectedOptions, (o) => o.value))}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button className="button w-full" disabled={saving || !authors.length || !categories.length}>
        {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar livro"}
      </button>
    </form>
  );
}
