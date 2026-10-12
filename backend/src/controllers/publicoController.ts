import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Ocorrencia } from "../entities/Ocorrencia";

const repositorioOcorrencia = AppDataSource.getRepository(Ocorrencia);

// Dados agregados da transparência pública. Não expõe nenhum dado pessoal.
export async function resumo(_req: Request, res: Response): Promise<void> {
  const porStatus: { status: string; total: number }[] = await AppDataSource.query(
    "select status, count(*)::int as total from ocorrencias group by status"
  );

  const total = (...lista: string[]) =>
    porStatus.filter((linha) => lista.includes(linha.status)).reduce((soma, linha) => soma + linha.total, 0);

  const tempoGeral = await AppDataSource.query(
    `select round(avg(extract(epoch from (h.criado_em - o.criado_em)) / 86400)::numeric, 1) as dias
     from historicos_status h
     join ocorrencias o on o.id = h.ocorrencia_id
     where h.status_novo = 'concluida'`
  );

  const cidadaos = await AppDataSource.query("select count(*)::int as total from cidadaos");

  const porCategoria = await AppDataSource.query(
    `select c.id, c.nome, c.icone, count(o.id)::int as total
     from categorias c
     left join ocorrencias o on o.categoria_id = c.id
     group by c.id
     order by total desc, c.nome`
  );

  const porSecretaria = await AppDataSource.query(
    `select s.id, s.nome, s.sigla, count(distinct o.id)::int as total,
            round(avg(extract(epoch from (h.criado_em - o.criado_em)) / 86400)::numeric, 1) as tempo_medio_dias
     from secretarias s
     left join categorias c on c.secretaria_id = s.id
     left join ocorrencias o on o.categoria_id = c.id
     left join historicos_status h on h.ocorrencia_id = o.id and h.status_novo = 'concluida'
     group by s.id
     order by total desc, s.nome`
  );

  const notas: { nota: number; total: number }[] = await AppDataSource.query(
    "select nota, count(*)::int as total from avaliacoes group by nota"
  );
  const totalAvaliacoes = notas.reduce((soma, linha) => soma + linha.total, 0);
  const percentual = (...lista: number[]) =>
    totalAvaliacoes === 0
      ? 0
      : Math.round(
          (notas.filter((linha) => lista.includes(linha.nota)).reduce((soma, linha) => soma + linha.total, 0) /
            totalAvaliacoes) *
            100
        );

  res.status(200).json({
    satisfacao: {
      total_avaliacoes: totalAvaliacoes,
      taxa: percentual(3, 4),
      muito_satisfeito: percentual(4),
      satisfeito: percentual(3),
      neutro: percentual(2),
      insatisfeito: percentual(1),
    },
    abertas: total("registrada", "em_analise"),
    em_resolucao: total("encaminhada", "em_execucao"),
    resolvidas: total("concluida"),
    indeferidas: total("indeferida"),
    total: porStatus.reduce((soma, linha) => soma + linha.total, 0),
    tempo_medio_dias: tempoGeral[0].dias === null ? null : Number(tempoGeral[0].dias),
    total_cidadaos: cidadaos[0].total,
    por_categoria: porCategoria,
    por_secretaria: porSecretaria.map((linha: any) => ({
      ...linha,
      tempo_medio_dias: linha.tempo_medio_dias === null ? null : Number(linha.tempo_medio_dias),
    })),
  });
}

// Lista pública de ocorrências (usada no mapa e na tela inicial), sem dados do cidadão.
export async function listarOcorrenciasPublicas(req: Request, res: Response): Promise<void> {
  const { categoria_id } = req.query;

  const consulta = repositorioOcorrencia
    .createQueryBuilder("ocorrencia")
    .leftJoinAndSelect("ocorrencia.categoria", "categoria")
    .orderBy("ocorrencia.criado_em", "DESC")
    .take(200);

  if (categoria_id) {
    consulta.andWhere("categoria.id = :categoria_id", { categoria_id });
  }

  const ocorrencias = await consulta.getMany();

  res.status(200).json(
    ocorrencias.map((ocorrencia) => ({
      id: ocorrencia.id,
      protocolo: ocorrencia.protocolo,
      descricao: ocorrencia.descricao,
      status: ocorrencia.status,
      nivel_urgencia: ocorrencia.nivel_urgencia,
      criado_em: ocorrencia.criado_em,
      categoria: {
        id: ocorrencia.categoria.id,
        nome: ocorrencia.categoria.nome,
        icone: ocorrencia.categoria.icone,
      },
      endereco: ocorrencia.endereco,
      latitude: Number(ocorrencia.latitude),
      longitude: Number(ocorrencia.longitude),
    }))
  );
}
