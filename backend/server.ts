import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./config/data-source";

const porta = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida.");

    app.listen(porta, () => {
      console.log(`Servidor rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error("Erro ao conectar com o banco de dados:", erro);
    process.exit(1);
  });
