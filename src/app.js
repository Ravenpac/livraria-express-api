import express from 'express';
import dbConnect from './config/dbConnect.js';
import routes from './routes/index.js';

const connection = await dbConnect();

connection.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados:', err);
});

connection.once('open', () => {
  console.log('Conexão com o banco feita com sucesso');
});

const app = express();
routes(app);

export default app;
