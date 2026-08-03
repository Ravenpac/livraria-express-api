import { jest } from "@jest/globals";
import NotFoundError from "../errors/NotFoundError.js";

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule("../models/Author.js", () => ({
  author: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

const AuthorController = (await import("./authorController.js")).default;

function mockReq(overrides = {}) {
  return { params: {}, body: {}, ...overrides };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthorController", () => {
  describe("listAuthors", () => {
    it("retorna todos os autores com status 200", async () => {
      const authors = [{ nome: "Machado de Assis" }, { nome: "Clarice Lispector" }];
      mockFind.mockResolvedValue(authors);
      const req = mockReq();
      const res = mockRes();

      await AuthorController.listAuthors(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authors);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("DB error");
      mockFind.mockRejectedValue(error);
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.listAuthors(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAuthorById", () => {
    it("retorna um autor com status 200", async () => {
      const author = { _id: "abc123", nome: "Machado de Assis" };
      mockFindById.mockResolvedValue(author);
      const req = mockReq({ params: { id: "abc123" } });
      const res = mockRes();

      await AuthorController.getAuthorById(req, res);

      expect(mockFindById).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(author);
    });

    it("encaminha NotFoundError ao middleware quando o autor não é encontrado", async () => {
      mockFindById.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.getAuthorById(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Autor não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockFindById.mockRejectedValue(error);
      const req = mockReq({ params: { id: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.getAuthorById(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createAuthor", () => {
    it("cria um autor e retorna status 201", async () => {
      const body = { nome: "Novo Autor", nacionalidade: "Brasileira" };
      const created = { _id: "novo123", ...body };
      mockCreate.mockResolvedValue(created);
      const req = mockReq({ body });
      const res = mockRes();

      await AuthorController.createAuthor(req, res);

      expect(mockCreate).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Autor adicionado com sucesso",
        autor: created,
      });
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("Validation error");
      mockCreate.mockRejectedValue(error);
      const req = mockReq({ body: {} });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.createAuthor(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateAuthor", () => {
    it("atualiza um autor e retorna status 200", async () => {
      const updated = { _id: "abc123", nome: "Atualizado" };
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({ params: { id: "abc123" }, body: { nome: "Atualizado" } });
      const res = mockRes();

      await AuthorController.updateAuthor(req, res);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "abc123",
        { nome: "Atualizado" },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("encaminha NotFoundError ao middleware quando o autor não é encontrado", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.updateAuthor(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Autor não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockFindByIdAndUpdate.mockRejectedValue(error);
      const req = mockReq({ params: { id: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.updateAuthor(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteAuthor", () => {
    it("exclui um autor e retorna status 200", async () => {
      const deleted = { _id: "abc123", nome: "Removido" };
      mockFindByIdAndDelete.mockResolvedValue(deleted);
      const req = mockReq({ params: { id: "abc123" } });
      const res = mockRes();

      await AuthorController.deleteAuthor(req, res);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: "Autor excluído com sucesso" });
    });

    it("encaminha NotFoundError ao middleware quando o autor não é encontrado", async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.deleteAuthor(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Autor não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockFindByIdAndDelete.mockRejectedValue(error);
      const req = mockReq({ params: { id: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await AuthorController.deleteAuthor(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
