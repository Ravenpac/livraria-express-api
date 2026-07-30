import express from 'express';
import books from './bookRoutes.js';
import authors from './authorRoutes.js';

const router = (app) => {
  app.route('/').get((req, res) => {
    res.status(200).send('Curso de Node.js com Express API');
  });

  app.use(express.json(), books, authors);
};

export default router;
