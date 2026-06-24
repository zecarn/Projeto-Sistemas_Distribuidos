"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Feedback } from "@/components/feedback";
import { api } from "@/services/api-client";

type Stats = { books: number; authors: number; categories: number; available: number };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { api<Stats>("/api/stats").then(setStats).catch((e: Error) => setError(e.message)); }, []);

  const cards = [
    ["Livros no acervo", stats?.books, "/books"],
    ["Livros disponíveis", stats?.available, "/books"],
    ["Autores cadastrados", stats?.authors, "/authors"],
    ["Categorias", stats?.categories, "/categories"],
  ];

  return (
    <>
      <PageHeading eyebrow="Painel" title="Uma biblioteca bem organizada começa aqui." description="Acompanhe o acervo e navegue pelos cadastros principais do sistema." />
      <Feedback error={error} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, href]) => (
          <Link href={String(href)} key={String(label)} className="card group hover:-translate-y-0.5 hover:border-emerald-900/30">
            <p className="text-sm text-black/55">{label}</p>
            <p className="mt-3 text-4xl font-bold text-emerald-950">{value ?? "—"}</p>
            <p className="mt-5 text-sm font-semibold text-orange-700 group-hover:underline">Gerenciar →</p>
          </Link>
        ))}
      </section>
      <section className="mt-8 rounded-2xl bg-orange-100/70 p-6">
        <h2 className="text-lg font-bold">Modelo de dados</h2>
        <p className="mt-2 text-sm text-black/65">Cada autor pode possuir vários livros (1:N), e livros podem participar de várias categorias por meio de BookCategory (N:M).</p>
      </section>
    </>
  );
}
