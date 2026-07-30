import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockAuthorFindById = jest.fn();

jest.unstable_mockModule('../models/Book.js', () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

jest.unstable_mockModule('../models/Author.js', () => ({
  author: {
    findById: mockAuthorFindById,
  },
}));

const BookController = (await import('./bookController.js')).default;

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

describe('BookController', () => {
  describe('listBooks', () => {
    it('retorna todos os livros com status 200', async () => {
      const books = [{ titulo: 'A' }, { titulo: 'B' }];
      mockFind.mockResolvedValue(books);
      const req = mockReq();
      const res = mockRes();

      await BookController.listBooks(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it('retorna 500 em caso de erro', async () => {
      mockFind.mockRejectedValue(new Error('DB error'));
      const req = mockReq();
      const res = mockRes();

      await BookController.listBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'DB error - Falha ao listar os livros.',
      });
    });
  });

  describe('getBookById', () => {
    it('retorna um livro com status 200', async () => {
      const book = { _id: 'abc123', titulo: 'Teste' };
      mockFindById.mockResolvedValue(book);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(mockFindById).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it('retorna 404 quando o livro não é encontrado', async () => {
      mockFindById.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindById.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao buscar o livro.',
      });
    });
  });

  describe('createBook', () => {
    it('cria um livro e retorna status 201', async () => {
      const authorDoc = { _doc: { _id: 'autor123', nome: 'J.R.R. Tolkien' } };
      const body = { titulo: 'Novo', autor: 'autor123' };
      const fullBook = { _id: 'livro123', titulo: 'Novo', autor: authorDoc._doc };
      mockAuthorFindById.mockResolvedValue(authorDoc);
      mockCreate.mockResolvedValue(fullBook);
      const req = mockReq({ body });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(mockAuthorFindById).toHaveBeenCalledWith('autor123');
      expect(mockCreate).toHaveBeenCalledWith({
        titulo: 'Novo',
        autor: { _id: 'autor123', nome: 'J.R.R. Tolkien' },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Livro adicionado com sucesso',
        livro: fullBook,
      });
    });

    it('retorna 500 em caso de erro', async () => {
      mockAuthorFindById.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ body: { autor: 'invalido' } });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao adicionar o livro.',
      });
    });
  });

  describe('updateBook', () => {
    it('atualiza um livro com autor e retorna status 200', async () => {
      const authorDoc = { _doc: { _id: 'autor123', nome: 'J.R.R. Tolkien' } };
      const updated = { _id: 'abc123', titulo: 'Atualizado', autor: authorDoc._doc };
      mockAuthorFindById.mockResolvedValue(authorDoc);
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({
        params: { id: 'abc123' },
        body: { titulo: 'Atualizado', autor: 'autor123' },
      });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(mockAuthorFindById).toHaveBeenCalledWith('autor123');
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'abc123',
        { titulo: 'Atualizado', autor: { _id: 'autor123', nome: 'J.R.R. Tolkien' } },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('atualiza um livro sem autor e retorna status 200', async () => {
      const updated = { _id: 'abc123', titulo: 'Atualizado' };
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({ params: { id: 'abc123' }, body: { titulo: 'Atualizado' } });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'abc123',
        { titulo: 'Atualizado' },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('retorna 404 quando o livro não é encontrado', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' }, body: { titulo: 'X' } });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('retorna 404 quando o autor informado não existe', async () => {
      mockAuthorFindById.mockResolvedValue(null);
      const req = mockReq({
        params: { id: 'abc123' },
        body: { titulo: 'X', autor: 'inexistente' },
      });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Autor não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindByIdAndUpdate.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao atualizar o livro.',
      });
    });
  });

  describe('deleteBook', () => {
    it('exclui um livro e retorna status 200', async () => {
      const deleted = { _id: 'abc123', titulo: 'Removido' };
      mockFindByIdAndDelete.mockResolvedValue(deleted);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Livro excluído com sucesso');
    });

    it('retorna 404 quando o livro não é encontrado', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindByIdAndDelete.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao excluir o livro.',
      });
    });
  });
});
