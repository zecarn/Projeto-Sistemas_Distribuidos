"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { Feedback } from "@/components/feedback";
import { Loading } from "@/components/Loading";
import { api } from "@/services/api-client";

type Stats = {
  books: number;
  authors: number;
  categories: number;
  available: number;
  users: number;
  activeLoans: number;
  borrowed: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/stats")
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards: { icon: string; label: string; value: number | undefined; href: string }[] = [
    { icon: "📚", label: "Total de livros", value: stats?.books, href: "/books" },
    { icon: "✍️", label: "Total de autores", value: stats?.authors, href: "/authors" },
    { icon: "🧑‍🤝‍🧑", label: "Total de usuários", value: stats?.users, href: "/users" },
    { icon: "🔄", label: "Empréstimos ativos", value: stats?.activeLoans, href: "/loans" },
    { icon: "✅", label: "Livros disponíveis", value: stats?.available, href: "/books" },
    { icon: "📕", label: "Livros emprestados", value: stats?.borrowed, href: "/loans" },
  ];

  const links = [
    ["Livros", "/books"],
    ["Autores", "/authors"],
    ["Categorias", "/categories"],
    ["Usuários", "/users"],
    ["Empréstimos", "/loans"],
  ];

  return (
    <>
      <PageTitle
        eyebrow="Painel"
        title="Sistema de Biblioteca"
        description="Acompanhe o acervo, os empréstimos e os cadastros principais em um só lugar."
      />
      <Feedback error={error} />
      {loading ? (
        <Loading label="Carregando indicadores…" />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map(({ icon, label, value, href }) => (
            <Link href={href} key={label} className="card group flex items-start gap-4 hover:-translate-y-0.5 hover:border-emerald-900/30">
              <span className="text-3xl" aria-hidden>
                {icon}
              </span>
              <div>
                <p className="text-sm text-black/55">{label}</p>
                <p className="mt-1 text-4xl font-bold text-emerald-950">{value ?? "—"}</p>
                <p className="mt-3 text-sm font-semibold text-orange-700 group-hover:underline">Ver detalhes →</p>
              </div>
            </Link>
          ))}
        </section>
      )}
      <section className="mt-8 rounded-2xl bg-orange-100/70 p-6">
        <h2 className="text-lg font-bold">Navegação rápida</h2>
        <p className="mt-2 text-sm text-black/65">Acesse diretamente os módulos de gestão da biblioteca.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="button">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
