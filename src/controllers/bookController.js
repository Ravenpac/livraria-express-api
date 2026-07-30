import book from '../models/Book.js';
import { author } from '../models/Author.js';

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
    const newBook = req.body;

    try {
      const foundAuthor = await author.findById(newBook.autor);
      const fullBook = { ...newBook, autor: { ...foundAuthor._doc } };
      const createdBook = await book.create(fullBook);

      res.status(201).json({
        message: 'Livro adicionado com sucesso',
        livro: createdBook,
      });
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao adicionar o livro.` });
    }
  }

  static async updateBook(req, res) {
    const updatedBookData = req.body;
    const id = req.params.id;

    try {
      if (updatedBookData.autor) {
        const foundAuthor = await author.findById(updatedBookData.autor);
        if (!foundAuthor) {
          return res.status(404).send('Autor não encontrado');
        }
        updatedBookData.autor = { ...foundAuthor._doc };
      }

      const updatedBook = await book.findByIdAndUpdate(id, updatedBookData, { new: true });

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

  static async listBooksByPublisher(req, res) {
    try {
      const publisher = req.query.editora;
      const title = req.query.titulo;

      const filter = {};
      if (publisher) filter.editora = publisher;
      if (title) filter.titulo = title;

      const books = await book.find(filter);

      res.status(200).json(books);
    } catch (error) {
      res
        .status(500)
        .send({ message: `${error.message} - Falha ao listar os livros por editora.` });
    }
  }
}

export default BookController;
