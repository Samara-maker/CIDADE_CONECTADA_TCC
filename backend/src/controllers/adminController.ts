import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { Administrador } from "../entities/Administrador";
import { Secretaria } from "../entities/Secretaria";

// Lista de cidadãos com a quantidade de ocorrências de cada um (apenas administradores).
export async function listarCidadaos(_req: Request, res: Response): Promise<void> {
  const cidadaos = await AppDataSource.query(
    `select c.id, c.nome, c.email, c.telefone, c.ativo, c.criado_em,
            count(o.id)::int as total_ocorrencias
     from cidadaos c
     left join ocorrencias o on o.cidadao_id = c.id
     group by c.id
     order by c.criado_em desc`
  );

  res.status(200).json(cidadaos);
}

// Equipes de campo com a secretaria e a quantidade de ocorrências em andamento.
export async function listarEquipes(_req: Request, res: Response): Promise<void> {
  const equipes = await AppDataSource.query(
    `select e.id, e.nome, e.telefone, e.ativa, s.nome as secretaria,
            count(o.id) filter (where o.status not in ('concluida', 'indeferida'))::int as em_andamento,
            (select oc.endereco
               from ocorrencias oc
              where oc.equipe_campo_id = e.id and oc.status not in ('concluida', 'indeferida')
              order by oc.criado_em desc
              limit 1) as atuando
     from equipes_campo e
     left join secretarias s on s.id = e.secretaria_id
     left join ocorrencias o on o.equipe_campo_id = e.id
     group by e.id, s.nome
     order by s.nome, e.nome`
  );

  res.status(200).json(equipes);
}

// Lista os administradores cadastrados (tela de configurações). Não devolve a senha.
export async function listarAdministradores(_req: Request, res: Response): Promise<void> {
  const administradores = await AppDataSource.query(
    `select a.id, a.nome, a.email, a.ativo, (a.senha is not null) as tem_senha, s.nome as secretaria
     from administradores a
     left join secretarias s on s.id = a.secretaria_id
     order by a.nome`
  );

  res.status(200).json(administradores);
}

// Secretarias disponíveis para vincular a um novo administrador.
export async function listarSecretarias(_req: Request, res: Response): Promise<void> {
  const secretarias = await AppDataSource.getRepository(Secretaria).find({ order: { nome: "ASC" } });

  res.status(200).json(secretarias.map((s) => ({ id: s.id, nome: s.nome, sigla: s.sigla })));
}

// Apenas um administrador logado cadastra outro. A senha é opcional: sem ela, o acesso é pelo Google.
export async function criarAdministrador(req: Request, res: Response): Promise<void> {
  const { nome, email, senha, secretaria_id } = req.body;

  if (!nome || !email) {
    res.status(400).json({ erro: "Informe nome e e-mail" });
    return;
  }

  if (String(nome).trim().length < 3) {
    res.status(400).json({ erro: "O nome deve ter pelo menos 3 caracteres" });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ erro: "Informe um e-mail válido" });
    return;
  }

  if (senha && String(senha).length < 6) {
    res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres" });
    return;
  }

  const repositorio = AppDataSource.getRepository(Administrador);
  const emailFinal = String(email).trim().toLowerCase();

  if (await repositorio.findOne({ where: { email: emailFinal } })) {
    res.status(409).json({ erro: "Este e-mail já é de um administrador" });
    return;
  }

  let secretaria: Secretaria | null = null;

  if (secretaria_id) {
    secretaria = await AppDataSource.getRepository(Secretaria).findOne({ where: { id: secretaria_id } });

    if (!secretaria) {
      res.status(404).json({ erro: "Secretaria não encontrada" });
      return;
    }
  }

  const administrador = repositorio.create({
    nome: String(nome).trim(),
    email: emailFinal,
    senha: senha ? await bcrypt.hash(String(senha), 10) : null,
    ativo: true,
    secretaria,
  });

  await repositorio.save(administrador);

  res.status(201).json({
    id: administrador.id,
    nome: administrador.nome,
    email: administrador.email,
    ativo: administrador.ativo,
    secretaria: secretaria ? secretaria.nome : null,
  });
}

// Ativa ou desativa um administrador. Ninguém pode desativar a própria conta.
export async function alterarAtivoAdministrador(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { ativo } = req.body;

  if (typeof ativo !== "boolean") {
    res.status(400).json({ erro: "Informe se o administrador fica ativo ou não" });
    return;
  }

  if (id === req.usuario!.id && !ativo) {
    res.status(400).json({ erro: "Você não pode desativar a sua própria conta" });
    return;
  }

  const repositorio = AppDataSource.getRepository(Administrador);
  const administrador = await repositorio.findOne({ where: { id } });

  if (!administrador) {
    res.status(404).json({ erro: "Administrador não encontrado" });
    return;
  }

  administrador.ativo = ativo;
  await repositorio.save(administrador);

  res.status(200).json({ mensagem: ativo ? "Administrador ativado" : "Administrador desativado" });
}

const CHAVES_CONFIGURACAO = [
  "notif_confirmacao",
  "notif_status",
  "notif_resolvida",
  "notif_prazo",
  "notif_nao_municipal",
  "ia_ativa",
  "ia_citar_lei",
  "ia_bloquear_federal",
];

const PADROES_CONFIGURACAO: Record<string, string> = {
  notif_confirmacao: "true",
  notif_status: "true",
  notif_resolvida: "true",
  notif_prazo: "false",
  notif_nao_municipal: "true",
  ia_ativa: "true",
  ia_citar_lei: "true",
  ia_bloquear_federal: "true",
};

export async function obterConfiguracoes(_req: Request, res: Response): Promise<void> {
  const registros: { chave: string; valor: string }[] = await AppDataSource.query(
    "select chave, valor from configuracoes"
  );

  const resultado: Record<string, boolean> = {};

  for (const chave of CHAVES_CONFIGURACAO) {
    const encontrado = registros.find((registro) => registro.chave === chave);
    resultado[chave] = (encontrado ? encontrado.valor : PADROES_CONFIGURACAO[chave]) === "true";
  }

  res.status(200).json(resultado);
}

export async function salvarConfiguracoes(req: Request, res: Response): Promise<void> {
  for (const chave of CHAVES_CONFIGURACAO) {
    if (typeof req.body[chave] === "boolean") {
      await AppDataSource.query(
        `insert into configuracoes (chave, valor) values ($1, $2)
         on conflict (chave) do update set valor = excluded.valor`,
        [chave, String(req.body[chave])]
      );
    }
  }

  res.status(200).json({ mensagem: "Configurações salvas" });
}

// Altera o prazo padrão de resposta (em dias) de cada categoria
export async function salvarPrazos(req: Request, res: Response): Promise<void> {
  const prazos: { id: string; dias: number }[] = req.body.prazos || [];

  for (const prazo of prazos) {
    const dias = Number(prazo.dias);

    if (!prazo.id || !Number.isInteger(dias) || dias < 1 || dias > 90) {
      res.status(400).json({ erro: "Informe prazos entre 1 e 90 dias" });
      return;
    }

    await AppDataSource.query("update categorias set prazo_padrao_dias = $1 where id = $2", [dias, prazo.id]);
  }

  res.status(200).json({ mensagem: "Prazos salvos" });
}
