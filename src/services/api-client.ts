export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Erro HTTP ${response.status}.`);
    }
    if (response.status === 404) {
      throw new Error("Rota da API não encontrada. Reinicie o servidor de desenvolvimento e tente novamente.");
    }
    throw new Error(`Não foi possível concluir a operação (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
