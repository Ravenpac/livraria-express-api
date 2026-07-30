# 📚 Books API

API REST para gerenciar livros e autores, construída com **Node.js**, **Express** e **MongoDB**.

## Stack

| Ferramenta    | Finalidade             |
| ------------- | ---------------------- |
| Node.js 20    | Runtime                |
| Express 4     | Framework HTTP         |
| Mongoose 7    | ODM do MongoDB         |
| MongoDB Atlas | Banco de dados         |
| ESLint        | Linting                |
| Prettier      | Formatação             |
| EditorConfig  | Consistência no editor |
| Nodemon       | Hot-reload em dev      |
| Jest          | Testes                 |

## Setup

```bash
# instalar dependências
yarn

# criar .env com a string de conexão do MongoDB
# DB_CONNECTION_STRING=mongodb+srv://...
```

## Uso

```bash
# desenvolvimento (com auto-reload)
npm run dev

# linting e formatação
npm run lint
npm run lint:fix
npm run format
npm run format:check

# testes
npm test
```

## API

### Livros

| Método | Endpoint      | Descrição       |
| ------ | ------------- | --------------- |
| GET    | `/livros`     | Listar todos    |
| GET    | `/livros/:id` | Buscar por ID   |
| POST   | `/livros`     | Adicionar livro |
| PUT    | `/livros/:id` | Atualizar livro |
| DELETE | `/livros/:id` | Excluir livro   |

### Autores

| Método | Endpoint       | Descrição       |
| ------ | -------------- | --------------- |
| GET    | `/autores`     | Listar todos    |
| GET    | `/autores/:id` | Buscar por ID   |
| POST   | `/autores`     | Adicionar autor |
| PUT    | `/autores/:id` | Atualizar autor |
| DELETE | `/autores/:id` | Excluir autor   |

### Schemas

**Livro**

```json
{
  "titulo": "O Senhor dos Anéis",
  "autor": { "nome": "J.R.R. Tolkien" },
  "editora": "HarperCollins",
  "preco": 89.9,
  "paginas": 1200
}
```

**Autor**

```json
{
  "nome": "J.R.R. Tolkien",
  "nacionalidade": "Inglaterra"
}
```

Apenas `titulo` (livro) e `nome` (autor) são obrigatórios. O servidor roda em `http://localhost:3000`.
