import { useMemo, useState } from "react";
import Icon from "../../components/Icon";
import { Resumo } from "../../utils/tipos";
import { encerrada, formatarDias, horasDesde, numeroProtocolo } from "../../utils/format";
import { OcorrenciaAdmin } from "./tipos";

const CORES = [
  { fundo: "#cfe3d2", texto: "#065f2c", barra: "#065f2c", trilho: "#a8c8ac" },
  { fundo: "#fdecbb", texto: "#d99a00", barra: "#fdc21a", trilho: "#f5df9a" },
  { fundo: "#c9d5e8", texto: "#1180a8", barra: "#1d5bff", trilho: "#92a8d3" },
  { fundo: "#f1d6da", texto: "#a3142c", barra: "#d6283c", trilho: "#e8b5bd" },
];

interface Props {
  resumo: Resumo | null;
  ocorrencias: OcorrenciaAdmin[];
  aoAtualizar: (o: OcorrenciaAdmin) => void;
}

export default function Dashboard({ resumo, ocorrencias, aoAtualizar }: Props) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const ano = new Date().getFullYear();
  const sat = resumo?.satisfacao;

  const urgentes = useMemo(
    () =>
      ocorrencias
        .filter((o) => o.nivel_urgencia === "alta" && !encerrada(o.status))
        .filter((o) => !categoria || o.categoria.id === categoria)
        .filter((o) => {
          const termo = busca.trim().toLowerCase();
          return !termo || `${o.protocolo} ${o.categoria.nome} ${o.endereco}`.toLowerCase().includes(termo);
        })
        .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()),
    [ocorrencias, busca, categoria]
  );

  const categorias = Array.from(new Map(ocorrencias.map((o) => [o.categoria.id, o.categoria.nome])).entries());

  return (
    <>
      <div className="cc-stats cc-stats-5">
        <div className="cc-stat verde"><div className="cc-stat-num">{resumo?.abertas ?? "-"}</div><div className="cc-stat-rot">Notificações abertas</div></div>
        <div className="cc-stat amarelo"><div className="cc-stat-num">{resumo?.em_resolucao ?? "-"}</div><div className="cc-stat-rot">Em andamento</div></div>
        <div className="cc-stat verde"><div className="cc-stat-num">{resumo?.resolvidas ?? "-"}</div><div className="cc-stat-rot">Resolvidos ({ano})</div></div>
        <div className="cc-stat azul"><div className="cc-stat-num">{resumo ? formatarDias(resumo.tempo_medio_dias) : "-"}</div><div className="cc-stat-rot">Tempo médio de resposta</div></div>
        <div className="cc-stat roxo"><div className="cc-stat-num">{sat && sat.total_avaliacoes > 0 ? `${sat.taxa}%` : "-"}</div><div className="cc-stat-rot">Taxa de Satisfação</div></div>
      </div>

      <div className="cc-dash">
        <div className="cc-urgentes cc-tabela-wrap" style={{ border: 0 }}>
          <div className="cc-urgentes-topo">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <i className="cc-bolinha" style={{ background: "#e11d2f", width: 12, height: 12 }} />
              Urgentes — Ação imediata
            </span>
            <div className="sel">
              <div className="cc-busca-adm" style={{ minWidth: 190, padding: "7px 10px" }}>
                <input placeholder="Pesquise aqui" value={busca} onChange={(e) => setBusca(e.target.value)} />
                <Icon nome="busca" />
              </div>
              <select className="cc-select-adm" style={{ minWidth: 130, padding: "7px 10px" }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Filtro</option>
                {categorias.map(([id, nome]) => (
                  <option key={id} value={id}>{nome}</option>
                ))}
              </select>
            </div>
          </div>
          <table className="cc-tabela">
            <thead>
              <tr><th>PROTO.</th><th>TIPO</th><th>LOCAL</th><th>HÁ</th><th>AÇÃO</th></tr>
            </thead>
            <tbody>
              {urgentes.map((o) => (
                <tr key={o.id}>
                  <td className="verde">{numeroProtocolo(o.protocolo)}</td>
                  <td>{o.categoria.nome.split(" ")[0]}</td>
                  <td>{o.endereco}</td>
                  <td className="vermelho">{horasDesde(o.criado_em) >= 48 ? `${Math.floor(horasDesde(o.criado_em) / 24)}D` : `${horasDesde(o.criado_em)}H`}</td>
                  <td><button className="cc-atualizar" onClick={() => aoAtualizar(o)}>ATUALIZAR</button></td>
                </tr>
              ))}
              {urgentes.length === 0 && (
                <tr><td colSpan={5} className="cc-vazio">Nenhuma ocorrência urgente em aberto.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="cc-caixa-sec">
          {resumo?.por_secretaria.map((s, indice) => {
            const cor = CORES[indice % CORES.length];
            const maior = Math.max(1, ...resumo.por_secretaria.map((x) => x.tempo_medio_dias ?? 0));
            return (
              <div key={s.id} className="cc-bloco-sec" style={{ background: cor.fundo }}>
                <div className="linha" style={{ color: cor.texto }}>
                  <span>{s.nome}</span>
                  <span>{formatarDias(s.tempo_medio_dias)}</span>
                </div>
                <div className="cc-barra" style={{ background: cor.trilho }}>
                  <div style={{ width: `${((s.tempo_medio_dias ?? 0) / maior) * 100}%`, background: cor.barra }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
