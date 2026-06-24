import { beforeEach, describe, expect, it, vi } from "vitest";

const { bookMock, authorMock } = vi.hoisted(() => ({
  bookMock: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
  authorMock: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock("@/services/book.service", () => ({ bookService: bookMock }));
vi.mock("@/services/author.service", () => ({ authorService: authorMock }));

import { GET as listBooks, POST as createBook } from "@/app/api/books/route";
import { DELETE as deleteBook, GET as getBook, PUT as updateBook } from "@/app/api/books/[id]/route";
import { POST as createAuthor } from "@/app/api/authors/route";
import { AppError } from "@/lib/errors/AppError";

const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Route Handlers da biblioteca", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET /api/books lista livros", async () => {
    bookMock.list.mockResolvedValue([{ id: 1, title: "Dom Casmurro" }]);
    const response = await listBooks(new Request("http://localhost/api/books"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: 1, title: "Dom Casmurro" }]);
  });

  it("POST /api/books cria um livro e retorna 201", async () => {
    const payload = { title: "Livro", authorId: 2, categoryIds: [1] };
    bookMock.create.mockResolvedValue({ id: 3, ...payload });
    const response = await createBook(new Request("http://localhost/api/books", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(201);
    expect(bookMock.create).toHaveBeenCalledWith(payload);
  });

  it("GET /api/books/:id valida o ID", async () => {
    const response = await getBook(new Request("http://localhost"), context("abc"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "ID inválido." });
  });

  it("GET /api/books/:id retorna 404 quando ausente", async () => {
    bookMock.get.mockRejectedValue(new AppError("Livro não encontrado.", 404));
    const response = await getBook(new Request("http://localhost"), context("99"));
    expect(response.status).toBe(404);
  });

  it("PUT /api/books/:id atualiza o livro", async () => {
    const payload = { title: "Novo", authorId: 1, categoryIds: [1] };
    bookMock.update.mockResolvedValue({ id: 1, ...payload });
    const response = await updateBook(new Request("http://localhost", { method: "PUT", body: JSON.stringify(payload) }), context("1"));
    expect(response.status).toBe(200);
    expect(bookMock.update).toHaveBeenCalledWith(1, payload);
  });

  it("DELETE /api/books/:id retorna JSON de sucesso", async () => {
    bookMock.remove.mockResolvedValue({ id: 1 });
    const response = await deleteBook(new Request("http://localhost"), context("1"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Livro excluído com sucesso.", book: { id: 1 } });
  });

  it("POST /api/authors rejeita JSON inválido", async () => {
    const response = await createAuthor(new Request("http://localhost", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
    expect(authorMock.create).not.toHaveBeenCalled();
  });
});
