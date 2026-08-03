import mongoose from "mongoose";
import { book } from "./index.js";

function validBook() {
  return {
    titulo: "O Senhor dos Anéis",
    autor: new mongoose.Types.ObjectId(),
    editora: "Casa do Código",
    preco: 89.9,
    paginas: 1200,
  };
}

describe("Book model", () => {
  it("valida um livro com dados válidos", async () => {
    await expect(new book(validBook()).validate()).resolves.toBeUndefined();
  });

  it("rejeita título ausente", async () => {
    const doc = new book({ ...validBook(), titulo: undefined });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { titulo: { message: "O título do livro é obrigatório" } },
    });
  });

  it("rejeita título em branco via validador global", async () => {
    const doc = new book({ ...validBook(), titulo: "   " });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { titulo: { message: "O campo titulo não pode estar vazio" } },
    });
  });

  it("rejeita autor ausente", async () => {
    const doc = new book({ ...validBook(), autor: undefined });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { autor: { message: "O autor do livro é obrigatório" } },
    });
  });

  it("rejeita editora ausente", async () => {
    const doc = new book({ ...validBook(), editora: undefined });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { editora: { message: "A editora do livro é obrigatória" } },
    });
  });

  it("rejeita editora fora dos valores permitidos", async () => {
    const doc = new book({ ...validBook(), editora: "HarperCollins" });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: {
        editora: {
          message:
            "A editora HarperCollins não é válida. Escolha entre: Casa do Código, Novatec, Alura ou Outros",
        },
      },
    });
  });

  it("rejeita paginas abaixo do mínimo", async () => {
    const doc = new book({ ...validBook(), paginas: 0 });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { paginas: { message: "O livro deve ter pelo menos uma página" } },
    });
  });

  it("rejeita paginas acima do máximo", async () => {
    const doc = new book({ ...validBook(), paginas: 5001 });
    await expect(doc.validate()).rejects.toMatchObject({
      errors: { paginas: { message: "O livro não pode ter mais de 5.000 páginas" } },
    });
  });
});
