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

| Método | Endpoint        | Descrição                                         |
| ------ | --------------- | ------------------------------------------------- |
| GET    | `/livros`       | Listar todos                                      |
| GET    | `/livros/busca` | Buscar por editora/titulo (`?editora=X&titulo=Y`) |
| GET    | `/livros/:id`   | Buscar por ID                                     |
| POST   | `/livros`       | Adicionar livro                                   |
| PUT    | `/livros/:id`   | Atualizar livro                                   |
| DELETE | `/livros/:id`   | Excluir livro                                     |

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

Request (POST/PUT):

```json
{
  "titulo": "O Senhor dos Anéis",
  "autor": "ID_DO_AUTOR",
  "editora": "Casa do Código",
  "preco": 89.9,
  "paginas": 1200
}
```

Response (`autor` é armazenado como referência ao ID do autor):

```json
{
  "_id": "abc123",
  "titulo": "O Senhor dos Anéis",
  "autor": "ID_DO_AUTOR",
  "editora": "Casa do Código",
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

`titulo`, `autor` e `editora` (livro) e `nome` (autor) são obrigatórios. O servidor roda em `http://localhost:3000`.

## Validações

Regras aplicadas pelos schemas do Mongoose (definidas em `src/models/`):

| Modelo | Campo     | Regra                                                        |
| ------ | --------- | ------------------------------------------------------------ |
| Livro  | `titulo`  | Obrigatório; não pode ficar em branco                        |
| Livro  | `autor`   | Obrigatório; ID de um autor existente                        |
| Livro  | `editora` | Obrigatório; valores: Casa do Código, Novatec, Alura, Outros |
| Livro  | `paginas` | Mínimo 1 e máximo 5.000                                      |
| Autor  | `nome`    | Obrigatório; não pode ficar em branco                        |

O validador global (`src/models/globalValidator.js`) impede que campos `String` sejam enviados apenas com espaços em branco, retornando `"O campo {campo} não pode estar vazio"`. Erros de validação são respondidos com status 400 (ver [Tratamento de erros](#tratamento-de-erros)).

## Tratamento de erros

Erros lançados nos controllers e middlewares são encaminhados ao `src/middlewares/errorManipulator.js`, que os converte em respostas padronizadas usando as classes de `src/errors/`:

| Erro                                                           | Status | Body                                                                          |
| -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| ID inválido (Mongoose `CastError`)                             | 400    | `{ "message": "Um ou mais dados fornecidos estão inválidos", "status": 400 }` |
| Campo obrigatório/regra do schema (Mongoose `ValidationError`) | 400    | `{ "message": "Os seguintes erros foram encontrados: ...", "status": 400 }`   |
| Recurso não encontrado (`NotFoundError`)                       | 404    | `{ "message": "...", "status": 404 }`                                         |
| Rota inexistente (`notFoundManipulator`)                       | 404    | `{ "message": "Página não encontrada", "status": 404 }`                       |
| Qualquer outro erro                                            | 500    | `{ "message": "Erro interno do servidor", "status": 500 }`                    |
