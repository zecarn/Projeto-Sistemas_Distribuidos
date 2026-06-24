"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { api } from "@/services/api-client";

type Author = { id: number; name: string };
type Category = { id: number; name: string };
type BookCategory = { category: Category };
type Book = {
  id: number; title: string; description: string | null; publishedYear: number | null;
  available: boolean; author: Author; categories: BookCategory[];
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bookData, authorData, categoryData] = await Promise.all([
        api<Book[]>("/api/books"), api<Author[]>("/api/authors"), api<Category[]>("/api/categories"),
      ]);
      setBooks(bookData); setAuthors(authorData); setCategories(categoryData); setError("");
    } catch (e) { setError((e as Error).message); }
  }, []);

  useEffect(() => {
    Promise.all([api<Book[]>("/api/books"), api<Author[]>("/api/authors"), api<Category[]>("/api/categories")])
      .then(([bookData, authorData, categoryData]) => {
        setBooks(bookData); setAuthors(authorData); setCategories(categoryData); setError("");
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/books", { method: "POST", body: JSON.stringify({
        title: form.get("title"), description: form.get("description"), publishedYear: form.get("publishedYear"),
        authorId: Number(form.get("authorId")), categoryIds: form.getAll("categoryIds").map(Number),
      }) });
      event.currentTarget.reset(); await load();
    } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!confirm("Remover este livro?")) return;
    try { await api(`/api/books/${id}`, { method: "DELETE" }); await load(); }
    catch (e) { setError((e as Error).message); }
  }

  async function toggle(book: Book) {
    try {
      await api(`/api/books/${book.id}`, { method: "PUT", body: JSON.stringify({
        title: book.title, description: book.description, publishedYear: book.publishedYear,
        authorId: book.author.id, categoryIds: book.categories.map(({ category }) => category.id), available: !book.available,
      }) });
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  return <>
    <PageHeading eyebrow="Acervo" title="Livros" description="Cadastre títulos, defina o autor e organize cada obra em uma ou mais categorias." />
    <Feedback error={error} />
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <form onSubmit={submit} className="card h-fit space-y-4">
        <h2 className="text-lg font-bold">Novo livro</h2>
        <label className="block text-sm font-medium">Título<input className="field mt-1" name="title" required /></label>
        <label className="block text-sm font-medium">Descrição<textarea className="field mt-1 min-h-24" name="description" /></label>
        <label className="block text-sm font-medium">Ano de publicação<input className="field mt-1" name="publishedYear" type="number" min="0" max="9999" /></label>
        <label className="block text-sm font-medium">Autor<select className="field mt-1" name="authorId" required><option value="">Selecione</option>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label className="block text-sm font-medium">Categorias <span className="font-normal text-black/45">(Ctrl para várias)</span><select className="field mt-1 min-h-28" name="categoryIds" multiple required>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <button className="button w-full" disabled={saving || !authors.length || !categories.length}>{saving ? "Salvando…" : "Cadastrar livro"}</button>
      </form>
      <section className="space-y-3">
        {books.length === 0 && <div className="card text-black/55">Nenhum livro cadastrado.</div>}
        {books.map(book => <article key={book.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold text-emerald-950">{book.title}</h2><p className="mt-1 text-sm text-black/55">{book.author.name} · {book.categories.map(({ category }) => category.name).join(", ")}{book.publishedYear ? ` · ${book.publishedYear}` : ""}</p>{book.description && <p className="mt-2 text-sm text-black/65">{book.description}</p>}</div>
          <div className="flex shrink-0 items-center gap-2"><button onClick={() => toggle(book)} className={`rounded-full px-3 py-1 text-xs font-bold ${book.available ? "bg-emerald-100 text-emerald-800" : "bg-black/5 text-black/55"}`}>{book.available ? "Disponível" : "Indisponível"}</button><button onClick={() => remove(book.id)} className="button-danger">Excluir</button></div>
        </article>)}
      </section>
    </div>
  </>;
}
