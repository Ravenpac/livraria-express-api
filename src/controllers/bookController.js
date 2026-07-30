import book from '../models/Book.js';

class BookController {
  static async listBooks(req, res) {
    try {
      const books = await book.find({});

      res.status(200).json(books);
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao listar os livros.` });
    }
  }

  static async getBookById(req, res) {
    try {
      const id = req.params.id;
      const foundBook = await book.findById(id);

      if (foundBook) {
        res.status(200).json(foundBook);
      } else {
        res.status(404).send('Livro não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao buscar o livro.` });
    }
  }

  static async createBook(req, res) {
    try {
      const newBook = await book.create(req.body);

      res.status(201).json({
        message: 'Livro adicionado com sucesso',
        livro: newBook,
      });
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao adicionar o livro.` });
    }
  }

  static async updateBook(req, res) {
    try {
      const id = req.params.id;
      const updatedBook = await book.findByIdAndUpdate(id, req.body, { new: true });

      if (updatedBook) {
        res.status(200).json(updatedBook);
      } else {
        res.status(404).send('Livro não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao atualizar o livro.` });
    }
  }

  static async deleteBook(req, res) {
    try {
      const id = req.params.id;
      const deletedBook = await book.findByIdAndDelete(id);

      if (deletedBook) {
        res.status(200).send('Livro excluído com sucesso');
      } else {
        res.status(404).send('Livro não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao excluir o livro.` });
    }
  }
}

export default BookController;
