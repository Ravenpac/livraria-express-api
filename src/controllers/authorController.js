import NotFoundError from "../errors/NotFoundError.js";
import { author } from "../models/index.js";

class AuthorController {
  static async listAuthors(req, res, next) {
    try {
      const searchAuthors = author.find();

      req.results = searchAuthors;

      next();
    } catch (error) {
      next(error);
    }
  }

  static async getAuthorById(req, res, next) {
    try {
      const id = req.params.id;
      const foundAuthor = await author.findById(id);

      if (foundAuthor) {
        res.status(200).json(foundAuthor);
      } else {
        next(new NotFoundError("Autor não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }

  static async createAuthor(req, res, next) {
    try {
      const newAuthor = await author.create(req.body);

      res.status(201).json({
        message: "Autor adicionado com sucesso",
        autor: newAuthor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAuthor(req, res, next) {
    try {
      const id = req.params.id;
      const updatedAuthor = await author.findByIdAndUpdate(id, req.body, { new: true });

      if (updatedAuthor) {
        res.status(200).json(updatedAuthor);
      } else {
        next(new NotFoundError("Autor não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteAuthor(req, res, next) {
    try {
      const id = req.params.id;
      const deletedAuthor = await author.findByIdAndDelete(id);

      if (deletedAuthor) {
        res.status(200).send({ message: "Autor excluído com sucesso" });
      } else {
        next(new NotFoundError("Autor não encontrado"));
      }
    } catch (error) {
      next(error);
    }
  }
}

export default AuthorController;
