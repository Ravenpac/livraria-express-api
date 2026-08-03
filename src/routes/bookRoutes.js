import express from "express";
import BookController from "../controllers/bookController.js";

const router = express.Router();

router.get("/livros", BookController.listBooks);

router.get("/livros/busca", BookController.listBooksByPublisher);

router.get("/livros/:id", BookController.getBookById);

router.post("/livros", BookController.createBook);

router.put("/livros/:id", BookController.updateBook);

router.delete("/livros/:id", BookController.deleteBook);

export default router;
