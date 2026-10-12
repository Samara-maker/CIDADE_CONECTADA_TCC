import "reflect-metadata";
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes";
import categoriaRoutes from "./routes/categoriaRoutes";
import ocorrenciaRoutes from "./routes/ocorrenciaRoutes";
import publicoRoutes from "./routes/publicoRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", servico: "CidadeConecta API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/ocorrencias", ocorrenciaRoutes);
app.use("/api/publico", publicoRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

export default app;
