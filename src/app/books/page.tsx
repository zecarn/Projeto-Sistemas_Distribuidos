"use client";

import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { BookForm } from "@/components/books/book-form";
import { BookList } from "@/components/books/book-list";
import type { Author, Book, Category } from "@/components/books/types";
import { api } from "@/services/api-client";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const loadOptions = useCallback(async () => {
    try {
      const [authorData, categoryData] = await Promise.all([api<Author[]>("/api/authors"), api<Category[]>("/api/categories")]);
      setAuthors(authorData);
      setCategories(categoryData);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("title", search.trim());
      if (authorFilter) params.set("authorId", authorFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      const query = params.toString();
      const data = await api<Book[]>(`/api/books${query ? `?${query}` : ""}`);
      setBooks(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, authorFilter, categoryFilter]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    const timeout = setTimeout(loadBooks, 250);
    return () => clearTimeout(timeout);
  }, [loadBooks]);

  async function submit(data: {
    title: string;
    description: string;
    publishedYear: string;
    authorId: number;
    categoryIds: number[];
    available?: boolean;
  }) {
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      title: data.title,
      description: data.description || null,
      publishedYear: data.publishedYear ? Number(data.publishedYear) : null,
      authorId: data.authorId,
      categoryIds: data.categoryIds,
      ...(editing ? { available: data.available ?? editing.available } : {}),
    };
    try {
      if (editing) {
        await api(`/api/books/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setEditing(null);
        setSuccess("Livro atualizado com sucesso.");
      } else {
        await api("/api/books", { method: "POST", body: JSON.stringify(payload) });
        setSuccess("Livro cadastrado com sucesso.");
      }
      await loadBooks();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover este livro?")) return;
    setError("");
    setSuccess("");
    try {
      await api(`/api/books/${id}`, { method: "DELETE" });
      if (editing?.id === id) setEditing(null);
      setSuccess("Livro excluído com sucesso.");
      await loadBooks();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function toggleAvailable(book: Book) {
    setError("");
    setSuccess("");
    try {
      await api(`/api/books/${book.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: book.title,
          description: book.description,
          publishedYear: book.publishedYear,
          authorId: book.author.id,
          categoryIds: book.categories.map(({ category }) => category.id),
          available: !book.available,
        }),
      });
      await loadBooks();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="Acervo"
        title="Livros"
        description="Cadastre títulos, defina o autor e organize cada obra em uma ou mais categorias."
      />
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <BookForm
          authors={authors}
          categories={categories}
          editing={editing}
          saving={saving}
          onSubmit={submit}
          onCancelEdit={() => setEditing(null)}
        />
        <section className="space-y-4">
          <div className="card grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium">
              Buscar por título
              <input
                className="field mt-1"
                placeholder="Ex.: Dom Casmurro"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Filtrar por autor
              <select className="field mt-1" value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)}>
                <option value="">Todos</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Filtrar por categoria
              <select className="field mt-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {loading ? <Loading label="Carregando livros…" /> : (
            <BookList books={books} onEdit={setEditing} onToggleAvailable={toggleAvailable} onDelete={remove} />
          )}
        </section>
      </div>
    </>
  );
}
