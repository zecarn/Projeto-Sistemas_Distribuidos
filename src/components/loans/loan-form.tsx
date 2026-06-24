"use client";

import { FormEvent, useState } from "react";
import type { LoanBook, LoanUser } from "./types";

type LoanFormProps = {
  users: LoanUser[];
  books: LoanBook[];
  saving: boolean;
  onSubmit: (data: { userId: number; bookId: number }) => Promise<void>;
};

export function LoanForm({ users, books, saving, onSubmit }: LoanFormProps) {
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");

  const availableBooks = books.filter((b) => b.available);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ userId: Number(userId), bookId: Number(bookId) });
    setUserId("");
    setBookId("");
  }

  return (
    <form onSubmit={handleSubmit} className="card h-fit space-y-4">
      <h2 className="text-lg font-bold">Novo empréstimo</h2>
      <label className="block text-sm font-medium">
        Usuário
        <select className="field mt-1" value={userId} onChange={(e) => setUserId(e.target.value)} required>
          <option value="">Selecione</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Livro disponível
        <select className="field mt-1" value={bookId} onChange={(e) => setBookId(e.target.value)} required>
          <option value="">Selecione</option>
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </label>
      {availableBooks.length === 0 && (
        <p className="text-sm text-black/55">Não há livros disponíveis para empréstimo no momento.</p>
      )}
      <button className="button w-full" disabled={saving || !users.length || !availableBooks.length}>
        {saving ? "Registrando…" : "Registrar empréstimo"}
      </button>
    </form>
  );
}
