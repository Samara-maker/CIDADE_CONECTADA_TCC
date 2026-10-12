import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Ocorrencia, StatusOcorrencia } from "../entities/Ocorrencia";
import { Categoria } from "../entities/Categoria";
import { HistoricoStatus } from "../entities/HistoricoStatus";
import { ObservacaoInterna } from "../entities/ObservacaoInterna";
import { Confirmacao } from "../entities/Confirmacao";
import { EquipeCampo } from "../entities/EquipeCampo";
import { Avaliacao } from "../entities/Avaliacao";
import { analisarJurisdicao, lerConfiguracao } from "../utils/jurisdicao";
import { geocodificar } from "../utils/geocodificar";
import { gerarProtocolo } from "../utils/protocolo";
import { enviarEmailConfirmacaoOcorrencia, enviarEmailMudancaStatus } from "../utils/email";

const repositorioOcorrencia = AppDataSource.getRepository(Ocorrencia);
const repositorioCategoria = AppDataSource.getRepository(Categoria);
const repositorioHistorico = AppDataSource.getRepository(HistoricoStatus);
const repositorioObservacao = AppDataSource.getRepository(ObservacaoInterna);
const repositorioConfirmacao = AppDataSource.getRepository(Confirmacao);
const repositorioEquipe = AppDataSource.getRepository(EquipeCampo);
const repositorioAvaliacao = AppDataSource.getRepository(Avaliacao);

const NIVEIS_VALIDOS = ["baixa", "media", "alta"];
const STATUS_VALIDOS: StatusOcorrencia[] = [
  "registrada",
  "em_analise",
  "encaminhada",
  "em_execucao",
  "concluida",
  "indeferida",
];

// F4 + F5 + F6 - Registrar ocorrência, gerar protocolo e notificar o cidadão
export async function criarOcorrencia(req: Request, res: Response): Promise<void> {
  const { descricao, nivel_urgencia, categoria_id, endereco, latitude, longitude } = req.body;

  if (!descricao || !categoria_id || !endereco) {
    res.status(400).json({ erro: "Preencha categoria, endereço e descrição" });
    return;
  }

  if (descricao.trim().length < 20 || descricao.trim().length > 500) {
    res.status(400).json({ erro: "A descrição deve ter entre 20 e 500 caracteres" });
    return;
  }

  const nivel = nivel_urgencia || "media";

  if (!NIVEIS_VALIDOS.includes(nivel)) {
    res.status(400).json({ erro: "Nível de urgência inválido" });
    return;
  }

  const categoria = await repositorioCategoria.findOne({
    where: { id: categoria_id },
    relations: ["secretaria"],
  });

  if (!categoria) {
    res.status(404).json({ erro: "Categoria não encontrada" });
    return;
  }

  // Análise de jurisdição: rodovias federais não são competência do município
  const jurisdicao = await analisarJurisdicao(endereco, categoria.nome, categoria.secretaria.nome);

  if (jurisdicao.bloqueia) {
    res.status(422).json({ erro: jurisdicao.texto, jurisdicao });
    return;
  }

  // Se a tela enviou coordenadas usa elas, senão converte o endereço digitado
  const posicao =
    latitude !== undefined && longitude !== undefined
      ? { latitude: Number(latitude), longitude: Number(longitude) }
      : await geocodificar(endereco);

  const protocolo = await gerarProtocolo();

  const prazo = new Date();
  prazo.setDate(prazo.getDate() + categoria.prazo_padrao_dias);

  const ocorrencia = repositorioOcorrencia.create({
    protocolo,
    descricao: descricao.trim(),
    nivel_urgencia: nivel,
    status: "registrada",
    foto_url: req.file ? `/uploads/${req.file.filename}` : null,
    prazo_sla: prazo.toISOString().substring(0, 10),
    cidadao: { id: req.usuario!.id } as any,
    categoria,
    endereco: String(endereco).trim(),
    latitude: posicao.latitude,
    longitude: posicao.longitude,
  });

  await repositorioOcorrencia.save(ocorrencia);

  const ocorrenciaCompleta = await repositorioOcorrencia.findOne({
    where: { id: ocorrencia.id },
    relations: ["cidadao"],
  });

  if (ocorrenciaCompleta && (await lerConfiguracao("notif_confirmacao", "true")) === "true") {
    enviarEmailConfirmacaoOcorrencia(ocorrenciaCompleta.cidadao.email, protocolo).catch((erro) => {
      console.error("Falha ao enviar email de confirmação:", erro);
    });
  }

  res.status(201).json({
    mensagem: "Ocorrência registrada com sucesso",
    ocorrencia: {
      id: ocorrencia.id,
      protocolo: ocorrencia.protocolo,
      status: ocorrencia.status,
      prazo_sla: ocorrencia.prazo_sla,
      secretaria: categoria.secretaria.nome,
      categoria: categoria.nome,
      criado_em: ocorrencia.criado_em,
    },
  });
}

// Mostra ao cidadão a análise de jurisdição antes de enviar a notificação
export async function consultarJurisdicao(req: Request, res: Response): Promise<void> {
  const { categoria_id, endereco } = req.body;

  if (!categoria_id || !endereco) {
    res.status(400).json({ erro: "Informe a categoria e o endereço" });
    return;
  }

  const categoria = await repositorioCategoria.findOne({
    where: { id: categoria_id },
    relations: ["secretaria"],
  });

  if (!categoria) {
    res.status(404).json({ erro: "Categoria não encontrada" });
    return;
  }

  const resultado = await analisarJurisdicao(endereco, categoria.nome, categoria.secretaria.nome);

  res.status(200).json(resultado);
}

// O cidadão avalia o atendimento depois que a ocorrência é resolvida
export async function avaliarOcorrencia(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { nota, comentario } = req.body;

  if (![1, 2, 3, 4].includes(Number(nota))) {
    res.status(400).json({ erro: "Escolha uma das opções de satisfação" });
    return;
  }

  const ocorrencia = await repositorioOcorrencia.findOne({ where: { id }, relations: ["cidadao"] });

  if (!ocorrencia || ocorrencia.cidadao.id !== req.usuario!.id) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  if (ocorrencia.status !== "concluida") {
    res.status(400).json({ erro: "Só é possível avaliar ocorrências resolvidas" });
    return;
  }

  const jaAvaliada = await repositorioAvaliacao.count({ where: { ocorrencia: { id } } });

  if (jaAvaliada > 0) {
    res.status(409).json({ erro: "Esta ocorrência já foi avaliada" });
    return;
  }

  const avaliacao = repositorioAvaliacao.create({
    ocorrencia,
    cidadao: { id: req.usuario!.id } as any,
    nota: Number(nota),
    comentario: comentario ? String(comentario).trim() : null,
  });

  await repositorioAvaliacao.save(avaliacao);

  res.status(201).json({ mensagem: "Avaliação registrada. Obrigado!" });
}

// Lista as ocorrências do cidadão autenticado
export async function listarMinhasOcorrencias(req: Request, res: Response): Promise<void> {
  const ocorrencias = await repositorioOcorrencia.find({
    where: { cidadao: { id: req.usuario!.id } },
    relations: ["categoria"],
    order: { criado_em: "DESC" },
  });

  const avaliadas = await repositorioAvaliacao.find({
    where: { cidadao: { id: req.usuario!.id } },
    relations: ["ocorrencia"],
  });
  const idsAvaliados = new Set(avaliadas.map((avaliacao) => avaliacao.ocorrencia.id));

  res.status(200).json(ocorrencias.map((ocorrencia) => ({ ...ocorrencia, avaliada: idsAvaliados.has(ocorrencia.id) })));
}

// Detalhe de uma ocorrência. Qualquer usuário logado pode consultar, mas os dados
// do cidadão só aparecem para o próprio autor e para administradores.
export async function buscarOcorrenciaPorId(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const ocorrencia = await repositorioOcorrencia.findOne({
    where: { id },
    relations: ["categoria", "categoria.secretaria", "cidadao", "equipeCampo", "historicos"],
  });

  if (!ocorrencia) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  const ehAdministrador = req.usuario!.tipo === "administrador";
  const ehAutor = ocorrencia.cidadao.id === req.usuario!.id;

  const confirmacoesTotal = await repositorioConfirmacao.count({ where: { ocorrencia: { id } } });
  const jaConfirmei = ehAdministrador
    ? false
    : (await repositorioConfirmacao.count({
        where: { ocorrencia: { id }, cidadao: { id: req.usuario!.id } },
      })) > 0;

  const { cidadao, historicos, ...resto } = ocorrencia;

  res.status(200).json({
    ...resto,
    cidadao:
      ehAdministrador || ehAutor ? { id: cidadao.id, nome: cidadao.nome, email: cidadao.email } : null,
    historicos: historicos
      .map((historico) => ({
        id: historico.id,
        status_anterior: historico.status_anterior,
        status_novo: historico.status_novo,
        criado_em: historico.criado_em,
      }))
      .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()),
    confirmacoes_total: confirmacoesTotal,
    ja_confirmei: jaConfirmei,
    eh_autor: ehAutor,
  });
}

// Confirmação social: o cidadão confirma (ou desfaz a confirmação) de que o problema persiste.
export async function confirmarOcorrencia(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const ocorrencia = await repositorioOcorrencia.findOne({ where: { id } });

  if (!ocorrencia) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  const existente = await repositorioConfirmacao.findOne({
    where: { ocorrencia: { id }, cidadao: { id: req.usuario!.id } },
  });

  if (existente) {
    await repositorioConfirmacao.remove(existente);
  } else {
    const confirmacao = repositorioConfirmacao.create({
      ocorrencia,
      cidadao: { id: req.usuario!.id } as any,
    });
    await repositorioConfirmacao.save(confirmacao);
  }

  const total = await repositorioConfirmacao.count({ where: { ocorrencia: { id } } });

  res.status(200).json({ confirmado: !existente, total });
}

// Lista todas as ocorrências para o painel administrativo, com filtros simples
export async function listarTodasOcorrencias(req: Request, res: Response): Promise<void> {
  const { status, categoria_id } = req.query;

  const consulta = repositorioOcorrencia
    .createQueryBuilder("ocorrencia")
    .leftJoinAndSelect("ocorrencia.categoria", "categoria")
    .leftJoinAndSelect("categoria.secretaria", "secretaria")
    .leftJoinAndSelect("ocorrencia.equipeCampo", "equipe")
    .leftJoin("ocorrencia.cidadao", "cidadao")
    .addSelect(["cidadao.id", "cidadao.nome", "cidadao.email"])
    .orderBy("ocorrencia.criado_em", "DESC");

  if (status) {
    consulta.andWhere("ocorrencia.status = :status", { status });
  }

  if (categoria_id) {
    consulta.andWhere("categoria.id = :categoria_id", { categoria_id });
  }

  const ocorrencias = await consulta.getMany();

  res.status(200).json(ocorrencias);
}

// Atribui (ou remove) a equipe de campo responsável por uma ocorrência
export async function atribuirEquipe(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { equipe_id } = req.body;

  const ocorrencia = await repositorioOcorrencia.findOne({ where: { id } });

  if (!ocorrencia) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  if (!equipe_id) {
    ocorrencia.equipeCampo = null;
  } else {
    const equipe = await repositorioEquipe.findOne({ where: { id: equipe_id } });

    if (!equipe) {
      res.status(404).json({ erro: "Equipe não encontrada" });
      return;
    }

    ocorrencia.equipeCampo = equipe;
  }

  await repositorioOcorrencia.save(ocorrencia);

  res.status(200).json({ mensagem: "Equipe atualizada com sucesso" });
}

// F11 - Atualizar status da ocorrência e notificar o cidadão.
// Além do status, o administrador pode definir equipe, prazo, prioridade,
// observação interna e uma mensagem que segue por e-mail para o cidadão.
export async function atualizarStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, equipe_id, prazo_sla, nivel_urgencia, observacao, mensagem } = req.body;

  if (!status || !STATUS_VALIDOS.includes(status)) {
    res.status(400).json({ erro: "Status inválido" });
    return;
  }

  if (nivel_urgencia && !NIVEIS_VALIDOS.includes(nivel_urgencia)) {
    res.status(400).json({ erro: "Nível de urgência inválido" });
    return;
  }

  const ocorrencia = await repositorioOcorrencia.findOne({
    where: { id },
    relations: ["cidadao"],
  });

  if (!ocorrencia) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  const statusAnterior = ocorrencia.status;
  ocorrencia.status = status;

  if (nivel_urgencia) {
    ocorrencia.nivel_urgencia = nivel_urgencia;
  }

  if (prazo_sla) {
    ocorrencia.prazo_sla = String(prazo_sla).substring(0, 10);
  }

  if (equipe_id !== undefined) {
    if (equipe_id) {
      const equipe = await repositorioEquipe.findOne({ where: { id: equipe_id } });

      if (!equipe) {
        res.status(404).json({ erro: "Equipe não encontrada" });
        return;
      }

      ocorrencia.equipeCampo = equipe;
    } else {
      ocorrencia.equipeCampo = null;
    }
  }

  await repositorioOcorrencia.save(ocorrencia);

  if (status !== statusAnterior) {
    const historico = repositorioHistorico.create({
      ocorrencia,
      administrador: { id: req.usuario!.id } as any,
      status_anterior: statusAnterior,
      status_novo: status,
    });
    await repositorioHistorico.save(historico);
  }

  if (observacao && String(observacao).trim().length >= 3) {
    await repositorioObservacao.save(
      repositorioObservacao.create({
        ocorrencia,
        administrador: { id: req.usuario!.id } as any,
        texto: String(observacao).trim(),
      })
    );
  }

  const chaveNotificacao = status === "concluida" ? "notif_resolvida" : "notif_status";

  if ((await lerConfiguracao(chaveNotificacao, "true")) === "true") {
    enviarEmailMudancaStatus(
      ocorrencia.cidadao.email,
      ocorrencia.protocolo,
      statusAnterior,
      status,
      mensagem ? String(mensagem).trim() : undefined
    ).catch((erro) => {
      console.error("Falha ao enviar email de mudança de status:", erro);
    });
  }

  res.status(200).json({ mensagem: "Ocorrência atualizada com sucesso", status: ocorrencia.status });
}

// F12 - Adicionar observação interna (visível apenas para administradores)
export async function adicionarObservacao(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto || texto.trim().length < 3) {
    res.status(400).json({ erro: "Informe o texto da observação" });
    return;
  }

  const ocorrencia = await repositorioOcorrencia.findOne({ where: { id } });

  if (!ocorrencia) {
    res.status(404).json({ erro: "Ocorrência não encontrada" });
    return;
  }

  const observacao = repositorioObservacao.create({
    ocorrencia,
    administrador: { id: req.usuario!.id } as any,
    texto: texto.trim(),
  });

  await repositorioObservacao.save(observacao);

  res.status(201).json({ mensagem: "Observação adicionada com sucesso" });
}
