import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors/AppError";
import { handleApiError } from "@/lib/errors/handleApiError";

describe("padrão de erros da API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("retorna a mensagem e o status de AppError", async () => {
    const response = handleApiError(new AppError("Livro não encontrado", 404));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Livro não encontrado" });
  });

  it("retorna 500 sem expor detalhes de erros desconhecidos", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = handleApiError(new Error("senha do banco"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Erro interno do servidor." });
  });
});
