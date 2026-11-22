import { useMemo, useState } from "react";
import { Resumo } from "../../utils/tipos";
import { encerrada, formatarDias, horasDesde, numeroProtocolo } from "../../utils/format";
import { OcorrenciaAdmin } from "./tipos";

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

  const cartoes = [
    { cor: "success", numero: resumo?.abertas ?? "-", rotulo: "Notificações abertas" },
    { cor: "warning", numero: resumo?.em_resolucao ?? "-", rotulo: "Em andamento" },
    { cor: "success", numero: resumo?.resolvidas ?? "-", rotulo: `Resolvidos (${ano})` },
    { cor: "primary", numero: resumo ? formatarDias(resumo.tempo_medio_dias) : "-", rotulo: "Tempo médio de resposta" },
    { cor: "secondary", numero: sat && sat.total_avaliacoes > 0 ? `${sat.taxa}%` : "-", rotulo: "Taxa de satisfação" },
  ];

  const maior = Math.max(1, ...(resumo?.por_secretaria.map((x) => x.tempo_medio_dias ?? 0) ?? [0]));

  return (
    <>
      <h1 className="h3 mb-3">Dashboard</h1>

      <div className="row g-3 mb-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className="col-6 col-lg">
            <div className={`card h-100 shadow-sm border-0 border-start border-4 border-${c.cor}`}>
              <div className="card-body">
                <div className="fs-3 fw-bold">{c.numero}</div>
                <small className="text-muted">{c.rotulo}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span className="fw-semibold text-danger">Urgentes: ação imediata</span>
              <div className="d-flex gap-2">
                <input
                  className="form-control form-control-sm"
                  placeholder="Pesquise aqui"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <select className="form-select form-select-sm" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  <option value="">Filtro</option>
                  {categorias.map(([id, nome]) => (
                    <option key={id} value={id}>{nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Proto.</th><th>Tipo</th><th>Local</th><th>Há</th><th></th></tr>
                </thead>
                <tbody>
                  {urgentes.map((o) => (
                    <tr key={o.id}>
                      <td className="text-success fw-semibold">{numeroProtocolo(o.protocolo)}</td>
                      <td>{o.categoria.nome.split(" ")[0]}</td>
                      <td>{o.endereco}</td>
                      <td className="text-danger fw-semibold">
                        {horasDesde(o.criado_em) >= 48 ? `${Math.floor(horasDesde(o.criado_em) / 24)}d` : `${horasDesde(o.criado_em)}h`}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-success btn-sm" onClick={() => aoAtualizar(o)}>Atualizar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {urgentes.length === 0 && <p className="text-center text-muted py-4 mb-0">Nenhuma ocorrência urgente em aberto.</p>}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-semibold">Tempo médio por secretaria</div>
            <div className="card-body">
              {resumo?.por_secretaria.map((s) => (
                <div key={s.id} className="mb-3">
                  <div className="d-flex justify-content-between small">
                    <span>{s.nome}</span>
                    <span className="fw-semibold">{formatarDias(s.tempo_medio_dias)}</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-success" style={{ width: `${((s.tempo_medio_dias ?? 0) / maior) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
