import { book, author } from "../models/index.js";
import NotFoundError from "../errors/NotFoundError.js";
import InvalidRequest from "../errors/InvalidRequest.js";

class BookController {
  static async listBooks(req, res, next) {
    try {
      const searchBooks = book.find();

      req.results = searchBooks;

      next();
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

        if (!foundAuthor) {
          return next(new NotFoundError("Autor não encontrado"));
        }

        fullBook.autor = newBook.autor;
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

  static async listBooksByFilter(req, res, next) {
    try {
      const search = await BookController.buildSearchQuery(req.query, next);

      const searchBooks = book.find(search);

      req.results = searchBooks;

      next();
    } catch (error) {
      next(error);
    }
  }

  static async buildSearchQuery(parameters, next) {
    const { editora, titulo, minPaginas, maxPaginas, nomeAutor } = parameters;

    if (minPaginas && maxPaginas && parseInt(minPaginas) > parseInt(maxPaginas)) {
      return next(new InvalidRequest("minPaginas não pode ser maior que maxPaginas"));
    }

    const searchQuery = {};

    if (editora) {
      searchQuery.editora = { $regex: editora, $options: "i" };
    }

    if (titulo) {
      searchQuery.titulo = { $regex: titulo, $options: "i" };
    }

    if (minPaginas) {
      searchQuery.paginas = { ...searchQuery.paginas, $gte: parseInt(minPaginas) };
    }

    if (maxPaginas) {
      searchQuery.paginas = { ...searchQuery.paginas, $lte: parseInt(maxPaginas) };
    }

    if (nomeAutor) {
      const foundAuthor = await author.findOne({ nome: { $regex: nomeAutor, $options: "i" } });

      if (foundAuthor) {
        searchQuery.autor = foundAuthor._id;
      } else {
        searchQuery.autor = null;
      }
    }

    return searchQuery;
  }
}

export default BookController;
