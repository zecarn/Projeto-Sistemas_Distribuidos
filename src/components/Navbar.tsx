"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/books", label: "Livros" },
  { href: "/users", label: "Usuários" },
  { href: "/loans", label: "Empréstimos" },
  { href: "/authors", label: "Autores" },
  { href: "/categories", label: "Categorias" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-emerald-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span aria-hidden className="text-2xl">📚</span>
          Biblioteca Digital
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 font-medium transition ${
                  isActive ? "bg-white/15 text-white" : "text-emerald-50/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
