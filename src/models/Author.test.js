import { author } from "./index.js";

describe("Author model", () => {
  it("valida um autor com dados válidos", async () => {
    await expect(new author({ nome: "J.R.R. Tolkien" }).validate()).resolves.toBeUndefined();
  });

  it("rejeita nome ausente", async () => {
    await expect(new author({}).validate()).rejects.toMatchObject({
      errors: { nome: { message: "O nome do(a) autor(a) é obrigatório" } },
    });
  });

  it("rejeita nome em branco via validador global", async () => {
    await expect(new author({ nome: "   " }).validate()).rejects.toMatchObject({
      errors: { nome: { message: "O campo nome não pode estar vazio" } },
    });
  });
});
