import { useEffect, useState } from "react";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Icon from "../components/Icon";
import { Resumo } from "../utils/tipos";
import { formatarDias, pluralCasos } from "../utils/format";

const CORES_CATEGORIA = [
  { forte: "#065f2c", fraca: "#cfe0d4", texto: "#065f2c" },
  { forte: "#fdc21a", fraca: "#f8edd7", texto: "#f5a800" },
  { forte: "#1d5bff", fraca: "#93a9d6", texto: "#1d5bff" },
  { forte: "#ff2442", fraca: "#f6dde1", texto: "#b5172f" },
  { forte: "#718096", fraca: "#dfe3e8", texto: "#374151" },
];

const CORES_SECRETARIA = [
  { fundo: "#cfe3d2", texto: "#065f2c", barra: "#065f2c", trilho: "#a8c8ac" },
  { fundo: "#fdecbb", texto: "#f5a800", barra: "#fdc21a", trilho: "#f5df9a" },
  { fundo: "#c9d5e8", texto: "#1180a8", barra: "#1d5bff", trilho: "#92a8d3" },
];

export default function PainelPublico() {
  const [resumo, setResumo] = useState<Resumo | null>(null);

  useEffect(() => {
    api.get("/publico/resumo").then((r) => setResumo(r.data)).catch(() => setResumo(null));
  }, []);

  const maiorCategoria = Math.max(1, ...(resumo?.por_categoria.map((c) => c.total) ?? [1]));
  const maiorSecretaria = Math.max(1, ...(resumo?.por_secretaria.map((s) => s.total) ?? [1]));
  const sat = resumo?.satisfacao;
  const ano = new Date().getFullYear();

  const linhasSatisfacao = [
    { rotulo: "Muito satisfeito", valor: sat?.muito_satisfeito ?? 0, cor: "#065f2c", fundo: "#cfe0d4", icone: "muitoFeliz" },
    { rotulo: "Satisfeito", valor: sat?.satisfeito ?? 0, cor: "#3f8f47", fundo: "#cfe3d2", icone: "feliz" },
    { rotulo: "Neutro", valor: sat?.neutro ?? 0, cor: "#718096", fundo: "#dfe3e8", icone: "neutro" },
    { rotulo: "Insatisfeito", valor: sat?.insatisfeito ?? 0, cor: "#ff2442", fundo: "#f6dde1", icone: "triste" },
  ];

  return (
    <CitizenLayout>
      <div className="cc-conteudo" style={{ maxWidth: 1400 }}>
        <div className="cc-stats cc-stats-5">
          <div className="cc-stat verde">
            <div className="cc-stat-num">{resumo?.abertas ?? "-"}</div>
            <div className="cc-stat-rot">Notificações abertas</div>
          </div>
          <div className="cc-stat amarelo">
            <div className="cc-stat-num">{resumo?.em_resolucao ?? "-"}</div>
            <div className="cc-stat-rot">Em andamento</div>
          </div>
          <div className="cc-stat verde">
            <div className="cc-stat-num">{resumo?.resolvidas ?? "-"}</div>
            <div className="cc-stat-rot">Resolvidos ({ano})</div>
          </div>
          <div className="cc-stat azul">
            <div className="cc-stat-num">{resumo ? formatarDias(resumo.tempo_medio_dias) : "-"}</div>
            <div className="cc-stat-rot">Tempo médio de resposta</div>
          </div>
          <div className="cc-stat roxo">
            <div className="cc-stat-num">{sat && sat.total_avaliacoes > 0 ? `${sat.taxa}%` : "-"}</div>
            <div className="cc-stat-rot">Taxa de Satisfação</div>
          </div>
        </div>

        <div className="cc-tres">
          <div>
            <h2 className="cc-secao cc-secao-barra">Por categoria</h2>
            <div className="cc-caixa">
              {resumo?.por_categoria.map((categoria, indice) => {
                const cor = CORES_CATEGORIA[indice % CORES_CATEGORIA.length];
                return (
                  <div key={categoria.id} className="cc-meta-linha">
                    <div className="cc-meta">
                      <span>{categoria.nome}</span>
                      <span style={{ color: cor.texto }}>{categoria.total}</span>
                    </div>
                    <div className="cc-barra" style={{ background: cor.fraca }}>
                      <div style={{ width: `${(categoria.total / maiorCategoria) * 100}%`, background: cor.forte }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="cc-secao cc-secao-barra">Por Secretaria</h2>
            <div className="cc-caixa">
              {resumo?.por_secretaria.map((secretaria, indice) => {
                const cor = CORES_SECRETARIA[indice % CORES_SECRETARIA.length];
                return (
                  <div key={secretaria.id} className="cc-bloco-sec" style={{ background: cor.fundo }}>
                    <h4 style={{ color: cor.texto }}>{secretaria.nome}</h4>
                    <p>
                      <b>{pluralCasos(secretaria.total)}</b> T.médio:{" "}
                      {secretaria.tempo_medio_dias !== null ? `${String(secretaria.tempo_medio_dias).replace(".", ",")} dias` : "-"}
                    </p>
                    <div className="cc-barra" style={{ background: cor.trilho, margin: 0 }}>
                      <div style={{ width: `${(secretaria.total / maiorSecretaria) * 100}%`, background: cor.barra }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="cc-secao cc-secao-barra">Avaliação Cidadã</h2>
            <div className="cc-caixa">
              <div className="cc-satisfacao-num">{sat && sat.total_avaliacoes > 0 ? `${sat.taxa}%` : "-"}</div>
              <div className="cc-satisfacao-rot">
                {sat && sat.total_avaliacoes > 0
                  ? `Relação de satisfação (${sat.total_avaliacoes} ${sat.total_avaliacoes === 1 ? "avaliação" : "avaliações"})`
                  : "Ainda não há avaliações"}
              </div>
              {linhasSatisfacao.map((linha) => (
                <div key={linha.rotulo} className="cc-sat-linha">
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon nome={linha.icone} tamanho={16} />
                    {linha.rotulo}
                  </span>
                  <div className="cc-barra" style={{ background: linha.fundo }}>
                    <div style={{ width: `${linha.valor}%`, background: linha.cor }} />
                  </div>
                  <span>{linha.valor}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
