"use client";

import { useCallback, useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { LoanForm } from "@/components/loans/loan-form";
import { LoanList } from "@/components/loans/loan-list";
import type { Loan, LoanBook, LoanStatus, LoanUser } from "@/components/loans/types";
import { api } from "@/services/api-client";

const statusFilters: { label: string; value: "" | LoanStatus }[] = [
  { label: "Todos", value: "" },
  { label: "Em andamento", value: "ACTIVE" },
  { label: "Devolvidos", value: "RETURNED" },
];

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<LoanUser[]>([]);
  const [books, setBooks] = useState<LoanBook[]>([]);
  const [statusFilter, setStatusFilter] = useState<"" | LoanStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const [userData, bookData] = await Promise.all([api<LoanUser[]>("/api/users"), api<LoanBook[]>("/api/books")]);
      setUsers(userData);
      setBooks(bookData);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const loadLoans = useCallback(async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api<Loan[]>(`/api/loans${query}`);
      setLoans(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  async function submit(data: { userId: number; bookId: number }) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api("/api/loans", { method: "POST", body: JSON.stringify(data) });
      setSuccess("Empréstimo registrado com sucesso.");
      await Promise.all([loadLoans(), loadOptions()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function returnLoan(id: number) {
    setError("");
    setSuccess("");
    try {
      await api(`/api/loans/${id}/return`, { method: "PUT" });
      setSuccess("Devolução registrada com sucesso.");
      await Promise.all([loadLoans(), loadOptions()]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: number) {
    if (!confirm("Excluir este empréstimo finalizado?")) return;
    setError("");
    setSuccess("");
    try {
      await api(`/api/loans/${id}`, { method: "DELETE" });
      setSuccess("Empréstimo excluído com sucesso.");
      await loadLoans();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow="Circulação"
        title="Empréstimos"
        description="Registre novos empréstimos, controle devoluções e acompanhe o status de cada um."
      />
      <Feedback error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <LoanForm users={users} books={books} saving={saving} onSubmit={submit} />
        <section className="space-y-4">
          <div className="card flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-black/55">Status:</span>
            {statusFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  statusFilter === filter.value ? "bg-emerald-900 text-white" : "bg-black/5 text-black/55 hover:bg-black/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {loading ? <Loading label="Carregando empréstimos…" /> : <LoanList loans={loans} onReturn={returnLoan} onDelete={remove} />}
        </section>
      </div>
    </>
  );
}
