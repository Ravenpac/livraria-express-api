import express from "express";
import AuthorController from "../controllers/authorController.js";
import pagination from "../middlewares/pagination.js";

const router = express.Router();

router.get("/autores", AuthorController.listAuthors, pagination);

router.get("/autores/:id", AuthorController.getAuthorById);

router.post("/autores", AuthorController.createAuthor);

router.put("/autores/:id", AuthorController.updateAuthor);

router.delete("/autores/:id", AuthorController.deleteAuthor);

export default router;
