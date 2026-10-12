import { Router } from "express";
import { resumo, listarOcorrenciasPublicas } from "../controllers/publicoController";

const router = Router();

router.get("/resumo", resumo);
router.get("/ocorrencias", listarOcorrenciasPublicas);

export default router;
