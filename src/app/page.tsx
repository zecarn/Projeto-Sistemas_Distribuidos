"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
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
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stats>("/api/stats").then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  const cards = [
    ["Total de livros", stats?.books, "/books"],
    ["Total de autores", stats?.authors, "/authors"],
    ["Total de usuários", stats?.users, "/users"],
    ["Empréstimos ativos", stats?.activeLoans, "/loans"],
    ["Livros disponíveis", stats?.available, "/books"],
    ["Livros emprestados", stats?.borrowed, "/loans"],
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
      <PageHeading
        eyebrow="Painel"
        title="Sistema de Biblioteca"
        description="Acompanhe o acervo, os empréstimos e os cadastros principais em um só lugar."
      />
      <Feedback error={error} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link
            href={String(href)}
            key={String(label)}
            className="card group hover:-translate-y-0.5 hover:border-emerald-900/30"
          >
            <p className="text-sm text-black/55">{label}</p>
            <p className="mt-3 text-4xl font-bold text-emerald-950">{value ?? "—"}</p>
            <p className="mt-5 text-sm font-semibold text-orange-700 group-hover:underline">Ver detalhes →</p>
          </Link>
        ))}
      </section>
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
