import { Router } from "express";
import { login, loginGoogle, cadastrar, solicitarRecuperacaoSenha, redefinirSenha } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/google", loginGoogle);
router.post("/cadastro", cadastrar);
router.post("/recuperar-senha", solicitarRecuperacaoSenha);
router.post("/redefinir-senha", redefinirSenha);

export default router;
