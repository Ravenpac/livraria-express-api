import mongoose from "mongoose";

mongoose.Schema.Types.String.set("validate", {
  validator: (value) => {
    return value.trim().length > 0;
  },
  message: ({ path }) => `O campo ${path} não pode estar vazio`,
});
