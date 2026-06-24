import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entrelinhas | Biblioteca",
  description: "Sistema de gestão de acervo, autores e categorias",
};

const links = [
  ["/", "Visão geral"],
  ["/books", "Livros"],
  ["/authors", "Autores"],
  ["/categories", "Categorias"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <header className="border-b border-black/10 bg-emerald-950 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">Entrelinhas</Link>
            <nav className="flex flex-wrap gap-1 text-sm">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-2 text-emerald-50 hover:bg-white/10">{label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
