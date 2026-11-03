import Icon from "../../components/Icon";
import { Resumo } from "../../utils/tipos";
import { baixarCsv, formatarData, infoStatus, rotuloUrgencia } from "../../utils/format";
import { CidadaoAdmin, OcorrenciaAdmin } from "./tipos";

interface Props {
  ocorrencias: OcorrenciaAdmin[];
  cidadaos: CidadaoAdmin[];
  resumo: Resumo | null;
}

export default function Relatorios({ ocorrencias, resumo }: Props) {
  const mes = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const hoje = new Date();

  const linhaOcorrencia = (o: OcorrenciaAdmin) => [
    o.protocolo,
    formatarData(o.criado_em),
    o.categoria.nome,
    o.endereco,
    o.categoria.secretaria?.nome ?? "",
    infoStatus(o.status).rotulo,
    rotuloUrgencia(o.nivel_urgencia),
    formatarData(o.prazo_sla),
  ];

  const cabecalho = ["Protocolo", "Data", "Categoria", "Endereço", "Secretaria", "Status", "Urgência", "Prazo"];

  function mensal() {
    const doMes = ocorrencias.filter((o) => {
      const data = new Date(o.criado_em);
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    });
    baixarCsv("relatorio_mensal.csv", cabecalho, doMes.map(linhaOcorrencia));
  }

  function porSecretaria() {
    baixarCsv(
      "desempenho_secretarias.csv",
      ["Secretaria", "Sigla", "Ocorrências", "Tempo médio (dias)"],
      (resumo?.por_secretaria ?? []).map((s) => [s.nome, s.sigla, s.total, s.tempo_medio_dias ?? ""])
    );
  }

  function sla() {
    baixarCsv(
      "relatorio_sla.csv",
      ["Protocolo", "Secretaria", "Status", "Prazo", "Situação do prazo"],
      ocorrencias.map((o) => {
        const fechada = o.status === "concluida" || o.status === "indeferida";
        const vencida = !fechada && new Date(o.prazo_sla) < hoje;
        return [o.protocolo, o.categoria.secretaria?.nome ?? "", infoStatus(o.status).rotulo, formatarData(o.prazo_sla), fechada ? "Encerrada" : vencida ? "Vencido" : "No prazo"];
      })
    );
  }

  function conformidade() {
    baixarCsv(
      "transparencia_publica.csv",
      ["Protocolo", "Categoria", "Endereço", "Status", "Data"],
      ocorrencias.map((o) => [o.protocolo, o.categoria.nome, o.endereco, infoStatus(o.status).rotulo, formatarData(o.criado_em)])
    );
  }

  function calor() {
    baixarCsv(
      "pontos_do_mapa.csv",
      ["Endereço", "Latitude", "Longitude", "Categoria", "Status"],
      ocorrencias.map((o) => [o.endereco, o.latitude, o.longitude, o.categoria.nome, infoStatus(o.status).rotulo])
    );
  }

  const cartoes = [
    { icone: "grade", titulo: "Relatório Mensal", texto: `${mes} · Todas ocorrências`, acao: mensal },
    { icone: "caixa", titulo: "Por Secretaria", texto: "Desempenho por órgão", acao: porSecretaria },
    { icone: "relogio", titulo: "Relatório de SLA", texto: "Prazos cumpridos vs. vencidos", acao: sla },
    { icone: "baixar", titulo: "Exportar CSV", texto: "Dados brutos para análise", acao: () => baixarCsv("ocorrencias.csv", cabecalho, ocorrencias.map(linhaOcorrencia)) },
    { icone: "escudo", titulo: "Conformidade", texto: "Transparência obrigatória", acao: conformidade },
    { icone: "mapa", titulo: "Mapa de Calor", texto: "Pontos no mapa (lat/long)", acao: calor },
  ];

  return (
    <>
      <div className="cc-admin-cab">
        <h1 className="cc-titulo">Relatórios e Exportações</h1>
      </div>
      <div className="cc-cards-rel">
        {cartoes.map((c) => (
          <button key={c.titulo} className="cc-rel" onClick={c.acao}>
            <div>
              <Icon nome={c.icone} />
              <div>{c.titulo}</div>
              <div>{c.texto}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
