import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    nome: {
      type: String,
      required: [true, "O nome do(a) autor(a) é obrigatório"],
    },
    nacionalidade: {
      type: String,
    },
  },
  { versionKey: false },
);

const author = mongoose.model("autores", authorSchema);

export { author, authorSchema };
