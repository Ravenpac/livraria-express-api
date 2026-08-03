import { jest } from "@jest/globals";
import NotFoundError from "../errors/NotFoundError.js";
import InvalidRequest from "../errors/InvalidRequest.js";

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockAuthorFindById = jest.fn();
const mockAuthorFindOne = jest.fn();

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
    findOne: mockAuthorFindOne,
  },
}));

const BookController = (await import("./bookController.js")).default;

function mockReq(overrides = {}) {
  return { params: {}, body: {}, query: {}, ...overrides };
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
    it("define os resultados e encaminha ao próximo middleware", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooks(req, res, next);

      expect(mockFind).toHaveBeenCalledWith();
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("DB error");
      mockFind.mockImplementation(() => {
        throw error;
      });
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
      const book = { _id: "abc123", titulo: "Teste", autor: { nome: "Autor" } };
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
      const fullBook = { _id: "livro123", titulo: "Novo", autor: "autor123" };
      mockAuthorFindById.mockResolvedValue(authorDoc);
      mockCreate.mockResolvedValue(fullBook);
      const req = mockReq({ body });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(mockAuthorFindById).toHaveBeenCalledWith("autor123");
      expect(mockCreate).toHaveBeenCalledWith({
        titulo: "Novo",
        autor: "autor123",
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
      const updated = { _id: "abc123", titulo: "Atualizado", autor: "autor123" };
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
        { titulo: "Atualizado", autor: "autor123" },
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

  describe("listBooksByFilter", () => {
    it("define os resultados filtrados por editora e encaminha ao próximo middleware", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { editora: "HarperCollins" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({
        editora: { $regex: "HarperCollins", $options: "i" },
      });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("define os resultados filtrados por título e encaminha ao próximo middleware", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { titulo: "O Hobbit" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({
        titulo: { $regex: "O Hobbit", $options: "i" },
      });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
    });

    it("define os resultados filtrados por editora e título", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { editora: "HarperCollins", titulo: "O Hobbit" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({
        editora: { $regex: "HarperCollins", $options: "i" },
        titulo: { $regex: "O Hobbit", $options: "i" },
      });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("define todos os resultados quando não há filtros", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: {} });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("filtra por páginas mínimas", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { minPaginas: "100" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({ paginas: { $gte: 100 } });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("filtra por páginas máximas", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { maxPaginas: "500" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({ paginas: { $lte: 500 } });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("filtra por intervalo de páginas", async () => {
      const query = {};
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { minPaginas: "100", maxPaginas: "500" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({ paginas: { $gte: 100, $lte: 500 } });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("filtra pelo nome do autor", async () => {
      const query = {};
      mockAuthorFindOne.mockResolvedValue({ _id: "autor123", nome: "Tolkien" });
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { nomeAutor: "Tolkien" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockAuthorFindOne).toHaveBeenCalledWith({
        nome: { $regex: "Tolkien", $options: "i" },
      });
      expect(mockFind).toHaveBeenCalledWith({ autor: "autor123" });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("busca livros sem autor quando nenhum autor corresponde ao nome", async () => {
      const query = {};
      mockAuthorFindOne.mockResolvedValue(null);
      mockFind.mockReturnValue(query);
      const req = mockReq({ query: { nomeAutor: "Inexistente" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(mockFind).toHaveBeenCalledWith({ autor: null });
      expect(req.results).toBe(query);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("encaminha o erro ao middleware de tratamento de erros", async () => {
      const error = new Error("DB error");
      mockAuthorFindOne.mockRejectedValue(error);
      const req = mockReq({ query: { nomeAutor: "Tolkien" } });
      const res = mockRes();
      const next = jest.fn();

      await BookController.listBooksByFilter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("buildSearchQuery", () => {
    it("retorna query vazia quando não há filtros", async () => {
      const result = await BookController.buildSearchQuery({}, jest.fn());

      expect(result).toEqual({});
    });

    it("encaminha InvalidRequest ao middleware quando minPaginas é maior que maxPaginas", async () => {
      const next = jest.fn();

      const result = await BookController.buildSearchQuery(
        { minPaginas: "500", maxPaginas: "100" },
        next,
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "minPaginas não pode ser maior que maxPaginas",
          status: 400,
        }),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(InvalidRequest);
      expect(result).toBeUndefined();
    });
  });
});
