import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    autor: {
      type: String,
      required: true,
    },
    editora: {
      type: String,
    },
    preco: {
      type: Number,
    },
    paginas: {
      type: Number,
    },
  },
  { versionKey: false },
);

const book = mongoose.model('livros', bookSchema);

export default book;
