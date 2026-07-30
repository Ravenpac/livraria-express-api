import express from 'express';
import BookController from '../controllers/bookController.js';

const router = express.Router();

router.get('/books', BookController.listBooks);

router.get('/books/:id', BookController.getBookById);

router.post('/books', BookController.createBook);

router.put('/books/:id', BookController.updateBook);

router.delete('/books/:id', BookController.deleteBook);

export default router;
