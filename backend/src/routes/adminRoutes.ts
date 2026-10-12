import { Router } from "express";
import { autenticarAdministrador } from "../middleware/auth";
import {
  listarCidadaos,
  listarEquipes,
  listarAdministradores,
  listarSecretarias,
  criarAdministrador,
  alterarAtivoAdministrador,
  obterConfiguracoes,
  salvarConfiguracoes,
  salvarPrazos,
} from "../controllers/adminController";

const router = Router();

router.use(autenticarAdministrador);

router.get("/cidadaos", listarCidadaos);
router.get("/equipes", listarEquipes);
router.get("/administradores", listarAdministradores);
router.post("/administradores", criarAdministrador);
router.patch("/administradores/:id/ativo", alterarAtivoAdministrador);
router.get("/secretarias", listarSecretarias);
router.get("/configuracoes", obterConfiguracoes);
router.put("/configuracoes", salvarConfiguracoes);
router.put("/prazos", salvarPrazos);

export default router;
