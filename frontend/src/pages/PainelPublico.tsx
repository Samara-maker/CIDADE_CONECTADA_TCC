import { useEffect, useState } from "react";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Icon from "../components/Icon";
import { Resumo } from "../utils/tipos";
import { formatarDias, pluralCasos } from "../utils/format";

const CORES_CATEGORIA = ["#065f2c", "#fdc21a", "#1d5bff", "#ff2442", "#718096"];

const NIVEIS = [
  { campo: "muito_satisfeito", rotulo: "Muito satisfeito", cor: "#065f2c", icone: "muitoFeliz" },
  { campo: "satisfeito", rotulo: "Satisfeito", cor: "#3f8f47", icone: "feliz" },
  { campo: "neutro", rotulo: "Neutro", cor: "#718096", icone: "neutro" },
  { campo: "insatisfeito", rotulo: "Insatisfeito", cor: "#ff2442", icone: "triste" },
] as const;

export default function PainelPublico() {
  const [resumo, setResumo] = useState<Resumo | null>(null);

  useEffect(() => {
    api.get("/publico/resumo").then((r) => setResumo(r.data)).catch(() => setResumo(null));
  }, []);

  const maiorCategoria = Math.max(1, ...(resumo?.por_categoria.map((c) => c.total) ?? [1]));
  const maiorSecretaria = Math.max(1, ...(resumo?.por_secretaria.map((s) => s.total) ?? [1]));
  const sat = resumo?.satisfacao;
  const temAvaliacao = Boolean(sat && sat.total_avaliacoes > 0);

  const numeros = [
    { rotulo: "Notificações abertas", valor: resumo?.abertas ?? "-", cor: "success" },
    { rotulo: "Em andamento", valor: resumo?.em_resolucao ?? "-", cor: "warning" },
    { rotulo: `Resolvidos (${new Date().getFullYear()})`, valor: resumo?.resolvidas ?? "-", cor: "success" },
    { rotulo: "Tempo médio de resposta", valor: resumo ? formatarDias(resumo.tempo_medio_dias) : "-", cor: "primary" },
    { rotulo: "Taxa de satisfação", valor: temAvaliacao ? `${sat?.taxa}%` : "-", cor: "danger" },
  ];

  return (
    <CitizenLayout>
      <div className="container py-4">
        <div className="row g-3 mb-4">
          {numeros.map((item) => (
            <div key={item.rotulo} className="col-6 col-lg">
              <div className={`card h-100 border-0 border-start border-4 border-${item.cor} shadow-sm`}>
                <div className="card-body">
                  <div className="h3 mb-0">{item.valor}</div>
                  <small className="text-muted">{item.rotulo}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-3">Por categoria</h2>
                {resumo?.por_categoria.map((categoria, indice) => (
                  <div key={categoria.id} className="mb-3">
                    <div className="d-flex justify-content-between small">
                      <span>{categoria.nome}</span>
                      <strong>{categoria.total}</strong>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${(categoria.total / maiorCategoria) * 100}%`,
                          background: CORES_CATEGORIA[indice % CORES_CATEGORIA.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-3">Por secretaria</h2>
                {resumo?.por_secretaria.map((secretaria) => (
                  <div key={secretaria.id} className="border rounded p-3 mb-3">
                    <h3 className="h6 text-success">{secretaria.nome}</h3>
                    <p className="small mb-2">
                      <strong>{pluralCasos(secretaria.total)}</strong> · Tempo médio:{" "}
                      {secretaria.tempo_medio_dias !== null ? `${String(secretaria.tempo_medio_dias).replace(".", ",")} dias` : "-"}
                    </p>
                    <div className="progress" style={{ height: 8 }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${(secretaria.total / maiorSecretaria) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 mb-3">Avaliação cidadã</h2>
                <div className="display-5 text-success">{temAvaliacao ? `${sat?.taxa}%` : "-"}</div>
                <p className="text-muted small">
                  {sat && temAvaliacao
                    ? `Relação de satisfação (${sat.total_avaliacoes} ${sat.total_avaliacoes === 1 ? "avaliação" : "avaliações"})`
                    : "Ainda não há avaliações"}
                </p>
                {NIVEIS.map((nivel) => (
                  <div key={nivel.campo} className="d-flex align-items-center gap-2 mb-2">
                    <span className="small d-flex align-items-center gap-1" style={{ width: 150 }}>
                      <Icon nome={nivel.icone} tamanho={16} />
                      {nivel.rotulo}
                    </span>
                    <div className="progress flex-grow-1" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${sat?.[nivel.campo] ?? 0}%`, background: nivel.cor }} />
                    </div>
                    <span className="small text-end" style={{ width: 40 }}>
                      {sat?.[nivel.campo] ?? 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
