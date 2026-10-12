import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { Administrador } from "../entities/Administrador";

export interface TokenPayload {
  id: string;
  tipo: "cidadao" | "administrador";
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

function obterPayload(req: Request, res: Response): TokenPayload | null {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ erro: "Token não informado" });
    return null;
  }

  const token = header.substring(7);

  try {
    const segredo = process.env.JWT_SECRET || "segredo";
    const payload = jwt.verify(token, segredo) as TokenPayload;

    // tokens de outros usos (como a redefinição de senha) não servem para acessar o sistema
    if (payload.tipo !== "cidadao" && payload.tipo !== "administrador") {
      res.status(401).json({ erro: "Token inválido ou expirado" });
      return null;
    }

    return payload;
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
    return null;
  }
}

export function autenticarCidadao(req: Request, res: Response, next: NextFunction) {
  const payload = obterPayload(req, res);
  if (!payload) return;

  if (payload.tipo !== "cidadao") {
    res.status(403).json({ erro: "Acesso permitido apenas para cidadãos" });
    return;
  }

  req.usuario = payload;
  next();
}

export async function autenticarAdministrador(req: Request, res: Response, next: NextFunction) {
  const payload = obterPayload(req, res);
  if (!payload) return;

  if (payload.tipo !== "administrador") {
    res.status(403).json({ erro: "Acesso permitido apenas para administradores" });
    return;
  }

  // Se o administrador foi desativado depois do login, o acesso é negado na hora
  const administrador = await AppDataSource.getRepository(Administrador).findOne({ where: { id: payload.id } });

  if (!administrador || !administrador.ativo) {
    res.status(401).json({ erro: "Conta de administrador desativada" });
    return;
  }

  req.usuario = payload;
  next();
}

// Aceita tanto cidadão quanto administrador autenticado.
// Usada em rotas onde a regra de quem pode ver o quê é decidida no controller.
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const payload = obterPayload(req, res);
  if (!payload) return;

  req.usuario = payload;
  next();
}
