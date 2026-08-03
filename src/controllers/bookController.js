import { book } from "../models/index.js";
import { author } from "../models/index.js";
import NotFoundError from "../errors/NotFoundError.js";

class BookController {
  static async listBooks(req, res, next) {
    try {
      const books = await book.find({});

      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req, res, next) {
    try {
      const id = req.params.id;
      const foundBook = await book.findById(id);

      if (foundBook) {
        res.status(200).json(foundBook);
      } else {
        next(new NotFoundError("Livro não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }

  static async createBook(req, res, next) {
    const newBook = req.body;

    try {
      const fullBook = { ...newBook };

      if (newBook.autor) {
        const foundAuthor = await author.findById(newBook.autor);
        fullBook.autor = { ...foundAuthor._doc };
      } else {
        delete fullBook.autor;
      }

      const createdBook = await book.create(fullBook);

      res.status(201).json({
        message: "Livro adicionado com sucesso",
        livro: createdBook,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    const updatedBookData = req.body;
    const id = req.params.id;

    try {
      if (updatedBookData.autor) {
        const foundAuthor = await author.findById(updatedBookData.autor);
        if (!foundAuthor) {
          return next(new NotFoundError("Autor não encontrado"));
        }
        updatedBookData.autor = { ...foundAuthor._doc };
      }

      const updatedBook = await book.findByIdAndUpdate(id, updatedBookData, { new: true });

      if (updatedBook) {
        res.status(200).json(updatedBook);
      } else {
        next(new NotFoundError("Livro não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      const id = req.params.id;
      const deletedBook = await book.findByIdAndDelete(id);

      if (deletedBook) {
        res.status(200).send({ message: "Livro excluído com sucesso" });
      } else {
        next(new NotFoundError("Livro não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }

  static async listBooksByPublisher(req, res, next) {
    try {
      const publisher = req.query.editora;
      const title = req.query.titulo;

      const filter = {};
      if (publisher) filter.editora = publisher;
      if (title) filter.titulo = title;

      const books = await book.find(filter);

      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }
}

export default BookController;
