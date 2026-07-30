# AGENTS.md — nodejs-lib

Simple Express + Mongoose REST API (Alura course project). Single package, ES modules.

## Commands

| Action               | Command                           |
| -------------------- | --------------------------------- |
| Lint                 | `npm run lint`                    |
| Auto-fix lint        | `npm run lint:fix`                |
| Format               | `npm run format`                  |
| Check formatting     | `npm run format:check`            |
| Dev server (nodemon) | `npm run dev`                     |
| Run tests            | `npm test` (Jest, no config file) |

## Structure

- `server.js` — entrypoint; imports `dotenv/config`, bootstraps app on `:3000`
- `src/app.js` — Express setup + MongoDB connect (top-level `await`)
- `src/config/dbConnect.js` — `mongoose.connect(process.env.DB_CONNECTION_STRING)`
- `src/models/Book.js` — Schema: `titulo` (req), `autor` (req), `editora`, `preco`, `paginas`; `versionKey: false`
- `src/controllers/bookController.js` — static methods: `listBooks`, `getBookById`, `createBook`, `updateBook`, `deleteBook`
- `src/routes/bookRoutes.js` — RESTful CRUD for `/books` (GET, POST, GET/:id, PUT/:id, DELETE/:id)

## Key facts

- **ESM throughout** (`"type": "module"`) — use `import`/`export`, never `require`
- **Env**: `.env` file (gitignored) must contain `DB_CONNECTION_STRING` — loaded by `import 'dotenv/config'` in `server.js`
- **ESLint** configured (flat config in `eslint.config.js`) — `no-console` as `warn`, `no-unused-vars` as `error` (ignoring `_`-prefixed args)
- **No test files exist** yet — create `.test.js` files alongside source; Jest runs without config
- **MongoDB connection** happens at module import time (side effect in `src/app.js`)
