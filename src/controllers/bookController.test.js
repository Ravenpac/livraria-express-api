import { jest } from "@jest/globals";
import NotFoundError from "../errors/NotFoundError.js";

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockAuthorFindById = jest.fn();

jest.unstable_mockModule("../models/Book.js", () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

jest.unstable_mockModule("../models/Author.js", () => ({
  author: {
    findById: mockAuthorFindById,
  },
}));

const BookController = (await import("./bookController.js")).default;

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

describe("BookController", () => {
  describe("listBooks", () => {
    it("retorna todos os livros com status 200", async () => {
      const books = [{ titulo: "A" }, { titulo: "B" }];
      mockFind.mockResolvedValue(books);
      const req = mockReq();
      const res = mockRes();

      await BookController.listBooks(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("DB error");
      mockFind.mockRejectedValue(error);
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooks(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getBookById", () => {
    it("retorna um livro com status 200", async () => {
      const book = { _id: "abc123", titulo: "Teste" };
      mockFindById.mockResolvedValue(book);
      const req = mockReq({ params: { id: "abc123" } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(mockFindById).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it("encaminha NotFoundError ao middleware quando o livro não é encontrado", async () => {
      mockFindById.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.getBookById(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Livro não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockFindById.mockRejectedValue(error);
      const req = mockReq({ params: { id: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.getBookById(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createBook", () => {
    it("cria um livro e retorna status 201", async () => {
      const authorDoc = { _doc: { _id: "autor123", nome: "J.R.R. Tolkien" } };
      const body = { titulo: "Novo", autor: "autor123" };
      const fullBook = { _id: "livro123", titulo: "Novo", autor: authorDoc._doc };
      mockAuthorFindById.mockResolvedValue(authorDoc);
      mockCreate.mockResolvedValue(fullBook);
      const req = mockReq({ body });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(mockAuthorFindById).toHaveBeenCalledWith("autor123");
      expect(mockCreate).toHaveBeenCalledWith({
        titulo: "Novo",
        autor: { _id: "autor123", nome: "J.R.R. Tolkien" },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Livro adicionado com sucesso",
        livro: fullBook,
      });
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockAuthorFindById.mockRejectedValue(error);
      const req = mockReq({ body: { autor: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.createBook(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });

    it("encaminha a validação do mongoose ao middleware quando autor está ausente ou vazio", async () => {
      const error = new Error("ValidationError");
      const body = { titulo: "Sem autor", autor: "" };
      mockCreate.mockRejectedValue(error);
      const req = mockReq({ body });
      const res = mockRes();
      const next = jest.fn();

      await BookController.createBook(req, res, next);

      expect(mockAuthorFindById).not.toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith({ titulo: "Sem autor" });
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateBook", () => {
    it("atualiza um livro com autor e retorna status 200", async () => {
      const authorDoc = { _doc: { _id: "autor123", nome: "J.R.R. Tolkien" } };
      const updated = { _id: "abc123", titulo: "Atualizado", autor: authorDoc._doc };
      mockAuthorFindById.mockResolvedValue(authorDoc);
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({
        params: { id: "abc123" },
        body: { titulo: "Atualizado", autor: "autor123" },
      });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(mockAuthorFindById).toHaveBeenCalledWith("autor123");
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "abc123",
        { titulo: "Atualizado", autor: { _id: "autor123", nome: "J.R.R. Tolkien" } },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("atualiza um livro sem autor e retorna status 200", async () => {
      const updated = { _id: "abc123", titulo: "Atualizado" };
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({ params: { id: "abc123" }, body: { titulo: "Atualizado" } });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        "abc123",
        { titulo: "Atualizado" },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("encaminha NotFoundError ao middleware quando o livro não é encontrado", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" }, body: { titulo: "X" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.updateBook(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Livro não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha NotFoundError ao middleware quando o autor informado não existe", async () => {
      mockAuthorFindById.mockResolvedValue(null);
      const req = mockReq({
        params: { id: "abc123" },
        body: { titulo: "X", autor: "inexistente" },
      });
      const res = mockRes();
      const next = jest.fn();

      await BookController.updateBook(req, res, next);

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

      await BookController.updateBook(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteBook", () => {
    it("exclui um livro e retorna status 200", async () => {
      const deleted = { _id: "abc123", titulo: "Removido" };
      mockFindByIdAndDelete.mockResolvedValue(deleted);
      const req = mockReq({ params: { id: "abc123" } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith("abc123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: "Livro excluído com sucesso" });
    });

    it("encaminha NotFoundError ao middleware quando o livro não é encontrado", async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      const req = mockReq({ params: { id: "inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.deleteBook(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Livro não encontrado", status: 404 }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("CastError");
      mockFindByIdAndDelete.mockRejectedValue(error);
      const req = mockReq({ params: { id: "invalido" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.deleteBook(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("listBooksByPublisher", () => {
    it("filtra livros por editora", async () => {
      const books = [{ titulo: "A", editora: "HarperCollins" }];
      mockFind.mockResolvedValue(books);
      const req = mockReq({ query: { editora: "HarperCollins" } });
      const res = mockRes();

      await BookController.listBooksByPublisher(req, res);

      expect(mockFind).toHaveBeenCalledWith({ editora: "HarperCollins" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("filtra livros por título", async () => {
      const books = [{ titulo: "O Hobbit" }];
      mockFind.mockResolvedValue(books);
      const req = mockReq({ query: { titulo: "O Hobbit" } });
      const res = mockRes();

      await BookController.listBooksByPublisher(req, res);

      expect(mockFind).toHaveBeenCalledWith({ titulo: "O Hobbit" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("filtra livros por editora e título", async () => {
      const books = [{ titulo: "O Hobbit", editora: "HarperCollins" }];
      mockFind.mockResolvedValue(books);
      const req = mockReq({ query: { editora: "HarperCollins", titulo: "O Hobbit" } });
      const res = mockRes();

      await BookController.listBooksByPublisher(req, res);

      expect(mockFind).toHaveBeenCalledWith({ editora: "HarperCollins", titulo: "O Hobbit" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("retorna todos quando não há filtros", async () => {
      const books = [{ titulo: "A" }, { titulo: "B" }];
      mockFind.mockResolvedValue(books);
      const req = mockReq({ query: {} });
      const res = mockRes();

      await BookController.listBooksByPublisher(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("DB error");
      mockFind.mockRejectedValue(error);
      const req = mockReq({ query: { editora: "X" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByPublisher(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
