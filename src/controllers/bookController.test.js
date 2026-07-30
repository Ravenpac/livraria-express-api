import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule('../models/Book.js', () => ({
  default: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
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
    it('returns all books with status 200', async () => {
      const books = [{ titulo: 'A' }, { titulo: 'B' }];
      mockFind.mockResolvedValue(books);
      const req = mockReq();
      const res = mockRes();

      await BookController.listBooks(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(books);
    });

    it('returns 500 on error', async () => {
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
    it('returns a book with status 200', async () => {
      const book = { _id: 'abc123', titulo: 'Teste' };
      mockFindById.mockResolvedValue(book);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(mockFindById).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(book);
    });

    it('returns 404 when book is not found', async () => {
      mockFindById.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await BookController.getBookById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('returns 500 on error', async () => {
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
    it('creates a book and returns status 201', async () => {
      const body = { titulo: 'Novo', autor: 'Autor' };
      const created = { _id: 'novo123', ...body };
      mockCreate.mockResolvedValue(created);
      const req = mockReq({ body });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(mockCreate).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Livro adicionado com sucesso',
        livro: created,
      });
    });

    it('returns 500 on error', async () => {
      mockCreate.mockRejectedValue(new Error('Validation error'));
      const req = mockReq({ body: {} });
      const res = mockRes();

      await BookController.createBook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Validation error - Falha ao adicionar o livro.',
      });
    });
  });

  describe('updateBook', () => {
    it('updates a book and returns status 200', async () => {
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

    it('returns 404 when book is not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await BookController.updateBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('returns 500 on error', async () => {
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
    it('deletes a book and returns status 200', async () => {
      const deleted = { _id: 'abc123', titulo: 'Removido' };
      mockFindByIdAndDelete.mockResolvedValue(deleted);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Livro excluído com sucesso');
    });

    it('returns 404 when book is not found', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await BookController.deleteBook(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Livro não encontrado');
    });

    it('returns 500 on error', async () => {
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
