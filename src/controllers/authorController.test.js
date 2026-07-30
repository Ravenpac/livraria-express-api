import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();

jest.unstable_mockModule('../models/Author.js', () => ({
  author: {
    find: mockFind,
    findById: mockFindById,
    create: mockCreate,
    findByIdAndUpdate: mockFindByIdAndUpdate,
    findByIdAndDelete: mockFindByIdAndDelete,
  },
}));

const AuthorController = (await import('./authorController.js')).default;

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

describe('AuthorController', () => {
  describe('listAuthors', () => {
    it('retorna todos os autores com status 200', async () => {
      const authors = [{ nome: 'Machado de Assis' }, { nome: 'Clarice Lispector' }];
      mockFind.mockResolvedValue(authors);
      const req = mockReq();
      const res = mockRes();

      await AuthorController.listAuthors(req, res);

      expect(mockFind).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authors);
    });

    it('retorna 500 em caso de erro', async () => {
      mockFind.mockRejectedValue(new Error('DB error'));
      const req = mockReq();
      const res = mockRes();

      await AuthorController.listAuthors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'DB error - Falha ao listar os autores.',
      });
    });
  });

  describe('getAuthorById', () => {
    it('retorna um autor com status 200', async () => {
      const author = { _id: 'abc123', nome: 'Machado de Assis' };
      mockFindById.mockResolvedValue(author);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await AuthorController.getAuthorById(req, res);

      expect(mockFindById).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(author);
    });

    it('retorna 404 quando o autor não é encontrado', async () => {
      mockFindById.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await AuthorController.getAuthorById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Autor não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindById.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await AuthorController.getAuthorById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao buscar o autor.',
      });
    });
  });

  describe('createAuthor', () => {
    it('cria um autor e retorna status 201', async () => {
      const body = { nome: 'Novo Autor', nacionalidade: 'Brasileira' };
      const created = { _id: 'novo123', ...body };
      mockCreate.mockResolvedValue(created);
      const req = mockReq({ body });
      const res = mockRes();

      await AuthorController.createAuthor(req, res);

      expect(mockCreate).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Autor adicionado com sucesso',
        autor: created,
      });
    });

    it('retorna 500 em caso de erro', async () => {
      mockCreate.mockRejectedValue(new Error('Validation error'));
      const req = mockReq({ body: {} });
      const res = mockRes();

      await AuthorController.createAuthor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Validation error - Falha ao adicionar o autor.',
      });
    });
  });

  describe('updateAuthor', () => {
    it('atualiza um autor e retorna status 200', async () => {
      const updated = { _id: 'abc123', nome: 'Atualizado' };
      mockFindByIdAndUpdate.mockResolvedValue(updated);
      const req = mockReq({ params: { id: 'abc123' }, body: { nome: 'Atualizado' } });
      const res = mockRes();

      await AuthorController.updateAuthor(req, res);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'abc123',
        { nome: 'Atualizado' },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it('retorna 404 quando o autor não é encontrado', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await AuthorController.updateAuthor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Autor não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindByIdAndUpdate.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await AuthorController.updateAuthor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao atualizar o autor.',
      });
    });
  });

  describe('deleteAuthor', () => {
    it('exclui um autor e retorna status 200', async () => {
      const deleted = { _id: 'abc123', nome: 'Removido' };
      mockFindByIdAndDelete.mockResolvedValue(deleted);
      const req = mockReq({ params: { id: 'abc123' } });
      const res = mockRes();

      await AuthorController.deleteAuthor(req, res);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Autor excluído com sucesso');
    });

    it('retorna 404 quando o autor não é encontrado', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);
      const req = mockReq({ params: { id: 'inexistente' } });
      const res = mockRes();

      await AuthorController.deleteAuthor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Autor não encontrado');
    });

    it('retorna 500 em caso de erro', async () => {
      mockFindByIdAndDelete.mockRejectedValue(new Error('CastError'));
      const req = mockReq({ params: { id: 'invalido' } });
      const res = mockRes();

      await AuthorController.deleteAuthor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'CastError - Falha ao excluir o autor.',
      });
    });
  });
});
