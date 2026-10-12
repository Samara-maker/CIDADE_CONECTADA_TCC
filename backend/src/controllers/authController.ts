import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { AppDataSource } from "../config/data-source";
import { Cidadao } from "../entities/Cidadao";
import { Administrador } from "../entities/Administrador";
import { enviarEmailCadastro, enviarEmailRecuperacaoSenha } from "../utils/email";

const repositorioCidadao = AppDataSource.getRepository(Cidadao);
const repositorioAdministrador = AppDataSource.getRepository(Administrador);
const clienteGoogle = new OAuth2Client();

function gerarToken(id: string, tipo: "cidadao" | "administrador"): string {
  const segredo = process.env.JWT_SECRET || "segredo";
  const expiracao = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ id, tipo }, segredo, { expiresIn: expiracao });
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// F1 - Login único: o sistema descobre sozinho se o e-mail é de cidadão ou de administrador
export async function login(req: Request, res: Response): Promise<void> {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: "Informe email e senha" });
    return;
  }

  const cidadao = await repositorioCidadao.findOne({ where: { email } });

  if (cidadao && cidadao.ativo && cidadao.senha && (await bcrypt.compare(senha, cidadao.senha))) {
    res.status(200).json({
      token: gerarToken(cidadao.id, "cidadao"),
      usuario: { id: cidadao.id, nome: cidadao.nome, email: cidadao.email, tipo: "cidadao" },
    });
    return;
  }

  const administrador = await repositorioAdministrador.findOne({
    where: { email },
    relations: ["secretaria"],
  });

  if (administrador && administrador.ativo && administrador.senha && (await bcrypt.compare(senha, administrador.senha))) {
    res.status(200).json({
      token: gerarToken(administrador.id, "administrador"),
      usuario: {
        id: administrador.id,
        nome: administrador.nome,
        email: administrador.email,
        tipo: "administrador",
        secretaria: administrador.secretaria ? administrador.secretaria.nome : null,
      },
    });
    return;
  }

  res.status(401).json({ erro: "Email ou senha inválidos" });
}

// F2 - Cadastro de cidadão
export async function cadastrar(req: Request, res: Response): Promise<void> {
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: "Informe nome, email e senha" });
    return;
  }

  if (nome.trim().length < 3) {
    res.status(400).json({ erro: "O nome deve ter pelo menos 3 caracteres" });
    return;
  }

  if (!emailValido(email)) {
    res.status(400).json({ erro: "Informe um email válido" });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  const emailExistente = await repositorioCidadao.findOne({ where: { email } });

  if (emailExistente) {
    res.status(409).json({ erro: "Este email já está cadastrado" });
    return;
  }

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const cidadao = repositorioCidadao.create({
    nome: nome.trim(),
    email,
    senha: senhaCriptografada,
    telefone: telefone || null,
  });

  await repositorioCidadao.save(cidadao);

  enviarEmailCadastro(cidadao.email, cidadao.nome).catch((erro) => {
    console.error("Falha ao enviar email de cadastro:", erro);
  });

  const token = gerarToken(cidadao.id, "cidadao");

  res.status(201).json({
    token,
    usuario: { id: cidadao.id, nome: cidadao.nome, email: cidadao.email, tipo: "cidadao" },
  });
}

// F3 - Recuperar senha (etapa 1: solicitar código)
export async function solicitarRecuperacaoSenha(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ erro: "Informe o email" });
    return;
  }

  const cidadao = await repositorioCidadao.findOne({ where: { email } });

  // Resposta igual exista ou não o email, para não expor quais emails estão cadastrados.
  if (!cidadao) {
    res.status(200).json({ mensagem: "Se o email existir, um link de recuperação será enviado" });
    return;
  }

  // O token vale 30 minutos e só funciona uma vez, porque guarda um pedaço do hash da senha atual.
  const token = jwt.sign(
    { id: cidadao.id, tipo: "reset", v: (cidadao.senha ?? "sem-senha").slice(-10) },
    process.env.JWT_SECRET || "segredo",
    { expiresIn: "30m" }
  );

  const link = `${process.env.FRONTEND_URL || "http://localhost:5173"}/redefinir-senha?token=${token}`;

  enviarEmailRecuperacaoSenha(cidadao.email, link).catch((erro) => {
    console.error("Falha ao enviar email de recuperação:", erro);
  });

  res.status(200).json({ mensagem: "Se o email existir, um link de recuperação será enviado" });
}

// F3 - Recuperar senha (etapa 2: redefinir usando o link recebido por e-mail)
export async function redefinirSenha(req: Request, res: Response): Promise<void> {
  const { token, senhaNova } = req.body;

  if (!token || !senhaNova) {
    res.status(400).json({ erro: "Informe o link de recuperação e a nova senha" });
    return;
  }

  if (senhaNova.length < 6) {
    res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  let payload: { id: string; tipo: string; v: string };

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "segredo") as typeof payload;
  } catch {
    res.status(400).json({ erro: "Link inválido ou expirado. Solicite um novo link." });
    return;
  }

  const cidadao = payload.tipo === "reset" ? await repositorioCidadao.findOne({ where: { id: payload.id } }) : null;

  if (!cidadao || (cidadao.senha ?? "sem-senha").slice(-10) !== payload.v) {
    res.status(400).json({ erro: "Link inválido ou expirado. Solicite um novo link." });
    return;
  }

  cidadao.senha = await bcrypt.hash(senhaNova, 10);
  await repositorioCidadao.save(cidadao);

  res.status(200).json({ mensagem: "Senha redefinida com sucesso" });
}

// Login e cadastro com Google. O token é conferido no servidor, nunca confiamos só no que o front envia.
export async function loginGoogle(req: Request, res: Response): Promise<void> {
  const { credencial } = req.body;
  const idCliente = process.env.GOOGLE_CLIENT_ID;

  if (!idCliente) {
    res.status(503).json({ erro: "Login com Google não está configurado no servidor" });
    return;
  }

  if (!credencial) {
    res.status(400).json({ erro: "Credencial do Google não informada" });
    return;
  }

  let dados;

  try {
    const ticket = await clienteGoogle.verifyIdToken({ idToken: credencial, audience: idCliente });
    dados = ticket.getPayload();
  } catch {
    res.status(401).json({ erro: "Não foi possível validar a conta do Google" });
    return;
  }

  if (!dados || !dados.email || !dados.sub || !dados.email_verified) {
    res.status(401).json({ erro: "A conta do Google precisa ter o e-mail verificado" });
    return;
  }

  const email = dados.email.toLowerCase();

  // Primeiro verifica se o e-mail é de um administrador cadastrado por outro administrador.
  // Administradores nunca são criados por aqui: só entra quem já foi cadastrado no painel.
  const administrador = await repositorioAdministrador.findOne({ where: { email }, relations: ["secretaria"] });

  if (administrador) {
    if (!administrador.ativo) {
      res.status(401).json({ erro: "Conta de administrador desativada" });
      return;
    }

    res.status(200).json({
      token: gerarToken(administrador.id, "administrador"),
      usuario: {
        id: administrador.id,
        nome: administrador.nome,
        email: administrador.email,
        tipo: "administrador",
        secretaria: administrador.secretaria ? administrador.secretaria.nome : null,
      },
    });
    return;
  }

  // Procura pelo identificador do Google e, se não achar, pelo e-mail já cadastrado
  let cidadao = await repositorioCidadao.findOne({ where: { google_id: dados.sub } });

  if (!cidadao) {
    cidadao = await repositorioCidadao.findOne({ where: { email } });

    if (cidadao) {
      cidadao.google_id = dados.sub;
      await repositorioCidadao.save(cidadao);
    }
  }

  if (!cidadao) {
    cidadao = repositorioCidadao.create({
      nome: (dados.name || email.split("@")[0]).trim().slice(0, 150),
      email,
      senha: null,
      google_id: dados.sub,
    });
    await repositorioCidadao.save(cidadao);

    enviarEmailCadastro(cidadao.email, cidadao.nome).catch((erro) => {
      console.error("Falha ao enviar email de cadastro:", erro);
    });
  }

  if (!cidadao.ativo) {
    res.status(401).json({ erro: "Conta desativada" });
    return;
  }

  res.status(200).json({
    token: gerarToken(cidadao.id, "cidadao"),
    usuario: { id: cidadao.id, nome: cidadao.nome, email: cidadao.email, tipo: "cidadao" },
  });
}
