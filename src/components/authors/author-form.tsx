"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { Author } from "./types";

type AuthorFormProps = {
  editing: Author | null;
  saving: boolean;
  onSubmit: (data: { name: string; bio: string }) => Promise<void>;
  onCancelEdit: () => void;
};

export function AuthorForm({ editing, saving, onSubmit, onCancelEdit }: AuthorFormProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    setName(editing?.name ?? "");
    setBio(editing?.bio ?? "");
  }, [editing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, bio });
    if (!editing) {
      setName("");
      setBio("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card h-fit space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? "Editar autor" : "Novo autor"}</h2>
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
      <label className="block text-sm font-medium">
        Biografia
        <textarea className="field mt-1 min-h-28 resize-y" value={bio} onChange={(e) => setBio(e.target.value)} />
      </label>
      <Button className="w-full" disabled={saving}>
        {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar autor"}
      </Button>
    </form>
  );
}
