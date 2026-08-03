import mongoose from "mongoose";
import autopopulate from "mongoose-autopopulate";

const bookSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    titulo: {
      type: String,
      required: [true, "O título do livro é obrigatório"],
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autores",
      required: [true, "O autor do livro é obrigatório"],
      autopopulate: true,
    },
    editora: {
      type: String,
      required: [true, "A editora do livro é obrigatória"],
      enum: {
        values: ["Casa do Código", "Novatec", "Alura", "Outros"],
        message:
          "A editora {VALUE} não é válida. Escolha entre: Casa do Código, Novatec, Alura ou Outros",
      },
    },
    preco: {
      type: Number,
    },
    paginas: {
      type: Number,
      min: [1, "O livro deve ter pelo menos uma página"],
      max: [5000, "O livro não pode ter mais de 5.000 páginas"],
    },
  },
  { versionKey: false },
);

bookSchema.plugin(autopopulate);

const book = mongoose.model("livros", bookSchema);

export default book;
