"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Feedback } from "./feedback";
import { api } from "@/services/api-client";

type Item = { id: number; name: string; bio?: string | null; _count?: { books: number } };

export function SimpleManager({ endpoint, noun, withBiography = false }: { endpoint: "authors" | "categories"; noun: string; withBiography?: boolean }) {
  const [items, setItems] = useState<Item[]>([]); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { try { setItems(await api<Item[]>(`/api/${endpoint}`)); setError(""); } catch (e) { setError((e as Error).message); } }, [endpoint]);
  useEffect(() => {
    api<Item[]>(`/api/${endpoint}`).then(setItems).catch((e: Error) => setError(e.message));
  }, [endpoint]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); const form = new FormData(event.currentTarget);
    try { await api(`/api/${endpoint}`, { method: "POST", body: JSON.stringify({ name: form.get("name"), bio: form.get("bio") }) }); event.currentTarget.reset(); await load(); }
    catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }
  async function remove(item: Item) {
    if (!confirm(`Remover ${item.name}?`)) return;
    try { await api(`/api/${endpoint}/${item.id}`, { method: "DELETE" }); await load(); } catch (e) { setError((e as Error).message); }
  }
  return <><Feedback error={error} /><div className="grid gap-6 lg:grid-cols-[340px_1fr]"><form onSubmit={submit} className="card h-fit space-y-4"><h2 className="text-lg font-bold">Novo {noun}</h2><label className="block text-sm font-medium">Nome<input name="name" className="field mt-1" required /></label>{withBiography && <label className="block text-sm font-medium">Biografia<textarea name="bio" className="field mt-1 min-h-28 resize-y" /></label>}<button className="button w-full" disabled={saving}>{saving ? "Salvando…" : "Cadastrar"}</button></form><section className="space-y-3">{items.length === 0 && <div className="card text-black/55">Nenhum registro cadastrado.</div>}{items.map(item => <article className="card flex items-start justify-between gap-4" key={item.id}><div><h2 className="font-bold text-emerald-950">{item.name}</h2>{item.bio && <p className="mt-1 text-sm text-black/55">{item.bio}</p>}<p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-700">{item._count?.books ?? 0} livro(s)</p></div><button className="button-danger" onClick={() => remove(item)}>Excluir</button></article>)}</section></div></>;
}
