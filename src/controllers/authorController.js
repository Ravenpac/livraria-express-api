import { author } from '../models/Author.js';

class AuthorController {
  static async listAuthors(req, res) {
    try {
      const authors = await author.find({});

      res.status(200).json(authors);
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao listar os autores.` });
    }
  }

  static async getAuthorById(req, res) {
    try {
      const id = req.params.id;
      const foundAuthor = await author.findById(id);

      if (foundAuthor) {
        res.status(200).json(foundAuthor);
      } else {
        res.status(404).send('Autor não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao buscar o autor.` });
    }
  }

  static async createAuthor(req, res) {
    try {
      const newAuthor = await author.create(req.body);

      res.status(201).json({
        message: 'Autor adicionado com sucesso',
        autor: newAuthor,
      });
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao adicionar o autor.` });
    }
  }

  static async updateAuthor(req, res) {
    try {
      const id = req.params.id;
      const updatedAuthor = await author.findByIdAndUpdate(id, req.body, { new: true });

      if (updatedAuthor) {
        res.status(200).json(updatedAuthor);
      } else {
        res.status(404).send('Autor não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao atualizar o autor.` });
    }
  }

  static async deleteAuthor(req, res) {
    try {
      const id = req.params.id;
      const deletedAuthor = await author.findByIdAndDelete(id);

      if (deletedAuthor) {
        res.status(200).send('Autor excluído com sucesso');
      } else {
        res.status(404).send('Autor não encontrado');
      }
    } catch (error) {
      res.status(500).send({ message: `${error.message} - Falha ao excluir o autor.` });
    }
  }
}

export default AuthorController;
