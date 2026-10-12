import { AppDataSource } from "../config/data-source";
import { Ocorrencia } from "../entities/Ocorrencia";

// Gera um protocolo no formato CC-ANO-SEQUENCIAL, por exemplo CC-2026-000123.
export async function gerarProtocolo(): Promise<string> {
  const ano = new Date().getFullYear();

  const repositorio = AppDataSource.getRepository(Ocorrencia);

  const total = await repositorio
    .createQueryBuilder("ocorrencia")
    .where("EXTRACT(YEAR FROM ocorrencia.criado_em) = :ano", { ano })
    .getCount();

  const sequencial = String(total + 1).padStart(6, "0");

  return `CC-${ano}-${sequencial}`;
}
