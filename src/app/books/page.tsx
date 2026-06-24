"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { api } from "@/services/api-client";

type Author = { id: number; name: string };
type Category = { id: number; name: string };
type Book = { id: number; title: string; isbn: string; available: boolean; category: Category; authors: Author[] };

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
        title: form.get("title"), isbn: form.get("isbn"), categoryId: Number(form.get("categoryId")),
        authorIds: form.getAll("authorIds").map(Number),
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
        title: book.title, isbn: book.isbn, categoryId: book.category.id,
        authorIds: book.authors.map((author) => author.id), available: !book.available,
      }) });
      await load();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <>
      <PageHeading eyebrow="Acervo" title="Livros" description="Cadastre títulos, associe seus autores e controle a disponibilidade." />
      <Feedback error={error} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="card h-fit space-y-4">
          <h2 className="text-lg font-bold">Novo livro</h2>
          <label className="block text-sm font-medium">Título<input className="field mt-1" name="title" required /></label>
          <label className="block text-sm font-medium">ISBN<input className="field mt-1" name="isbn" required /></label>
          <label className="block text-sm font-medium">Categoria<select className="field mt-1" name="categoryId" required><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="block text-sm font-medium">Autores <span className="font-normal text-black/45">(Ctrl para vários)</span><select className="field mt-1 min-h-28" name="authorIds" multiple required>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <button className="button w-full" disabled={saving || !authors.length || !categories.length}>{saving ? "Salvando…" : "Cadastrar livro"}</button>
          {(!authors.length || !categories.length) && <p className="text-xs text-orange-800">Cadastre ao menos um autor e uma categoria antes.</p>}
        </form>
        <section className="space-y-3">
          {books.length === 0 && <div className="card text-black/55">Nenhum livro cadastrado.</div>}
          {books.map(book => (
            <article key={book.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-bold text-emerald-950">{book.title}</h2><p className="mt-1 text-sm text-black/55">{book.authors.map(a => a.name).join(", ")} · {book.category.name} · ISBN {book.isbn}</p></div>
              <div className="flex shrink-0 items-center gap-2"><button onClick={() => toggle(book)} className={`rounded-full px-3 py-1 text-xs font-bold ${book.available ? "bg-emerald-100 text-emerald-800" : "bg-black/5 text-black/55"}`}>{book.available ? "Disponível" : "Indisponível"}</button><button onClick={() => remove(book.id)} className="button-danger">Excluir</button></div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}
