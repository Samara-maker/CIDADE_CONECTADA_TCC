import { Router } from "express";
import { autenticarCidadao, autenticarAdministrador, autenticar } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  criarOcorrencia,
  listarMinhasOcorrencias,
  buscarOcorrenciaPorId,
  confirmarOcorrencia,
  listarTodasOcorrencias,
  atribuirEquipe,
  atualizarStatus,
  adicionarObservacao,
  consultarJurisdicao,
  avaliarOcorrencia,
} from "../controllers/ocorrenciaController";

const router = Router();

// Rotas do cidadão
router.post("/", autenticarCidadao, upload.single("foto"), criarOcorrencia);
router.get("/minhas", autenticarCidadao, listarMinhasOcorrencias);
router.post("/jurisdicao", autenticarCidadao, consultarJurisdicao);
router.post("/:id/confirmar", autenticarCidadao, confirmarOcorrencia);
router.post("/:id/avaliar", autenticarCidadao, avaliarOcorrencia);

// Rotas do administrador
router.get("/", autenticarAdministrador, listarTodasOcorrencias);
router.patch("/:id/status", autenticarAdministrador, atualizarStatus);
router.patch("/:id/equipe", autenticarAdministrador, atribuirEquipe);
router.post("/:id/observacoes", autenticarAdministrador, adicionarObservacao);

// Rota compartilhada (o controller decide quais dados cada usuário pode ver)
router.get("/:id", autenticar, buscarOcorrenciaPorId);

export default router;
