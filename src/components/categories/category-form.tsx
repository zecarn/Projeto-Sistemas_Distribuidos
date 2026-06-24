"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Category } from "./types";

type CategoryFormProps = {
  editing: Category | null;
  saving: boolean;
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancelEdit: () => void;
};

export function CategoryForm({ editing, saving, onSubmit, onCancelEdit }: CategoryFormProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(editing?.name ?? "");
  }, [editing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name });
    if (!editing) setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="card h-fit space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? "Editar categoria" : "Nova categoria"}</h2>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-xs font-semibold text-black/50 hover:underline">
            Cancelar
          </button>
        )}
      </div>
      <label className="block text-sm font-medium">
        Nome
        <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <button className="button w-full" disabled={saving}>
        {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar categoria"}
      </button>
    </form>
  );
}
