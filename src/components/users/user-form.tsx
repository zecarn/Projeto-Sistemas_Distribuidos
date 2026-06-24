"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import type { User } from "./types";

type UserFormProps = {
  editing: User | null;
  saving: boolean;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
  onCancelEdit: () => void;
};

export function UserForm({ editing, saving, onSubmit, onCancelEdit }: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setName(editing?.name ?? "");
    setEmail(editing?.email ?? "");
  }, [editing]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, email });
    if (!editing) {
      setName("");
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card h-fit space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{editing ? "Editar usuário" : "Novo usuário"}</h2>
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
        Email
        <input
          className="field mt-1"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <Button className="w-full" disabled={saving}>
        {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar usuário"}
      </Button>
    </form>
  );
}
