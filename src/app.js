import express from "express";
import dbConnect from "./config/dbConnect.js";
import routes from "./routes/index.js";
import errorManipulator from "./middlewares/errorManipulator.js";
import notFoundManipulator from "./middlewares/notFoundManipulator.js";

const connection = await dbConnect();

connection.on("error", (err) => {
  console.error("Erro na conexão com o banco de dados:", err);
});

connection.once("open", () => {
  console.log("Conexão com o banco feita com sucesso");
});

const app = express();
routes(app);

app.use(notFoundManipulator);

app.use(errorManipulator);

export default app;
