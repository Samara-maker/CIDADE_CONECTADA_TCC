import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Selo from "../../components/Selo";
import { STATUS_OPCOES, dataCurta, encerrada, numeroProtocolo } from "../../utils/format";
import { OcorrenciaAdmin, ordenarPorUrgencia } from "./tipos";

interface Props {
  ocorrencias: OcorrenciaAdmin[];
  aoAtualizar: (o: OcorrenciaAdmin) => void;
}

export default function Ocorrencias({ ocorrencias, aoAtualizar }: Props) {
  const navegar = useNavigate();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [secretaria, setSecretaria] = useState("");

  const secretarias = Array.from(new Set(ocorrencias.map((o) => o.categoria.secretaria?.sigla).filter(Boolean))) as string[];
  const ativas = ocorrencias.filter((o) => !encerrada(o.status)).length;

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ordenarPorUrgencia(ocorrencias).filter(
      (o) =>
        (!status || o.status === status) &&
        (!secretaria || o.categoria.secretaria?.sigla === secretaria) &&
        (!termo || `${o.protocolo} ${o.categoria.nome} ${o.endereco}`.toLowerCase().includes(termo))
    );
  }, [ocorrencias, busca, status, secretaria]);

  return (
    <>
      <div className="mb-3">
        <h1 className="h3 mb-0">Todas as ocorrências</h1>
        <small className="text-muted">{ativas} ativas, ordenadas por urgência</small>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Pesquise aqui" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_OPCOES.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={secretaria} onChange={(e) => setSecretaria(e.target.value)}>
            <option value="">Todas as secretarias</option>
            {secretarias.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>#</th><th>Data</th><th>Categoria</th><th>Endereço</th><th>Status</th><th>Secretaria</th><th>SLA</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map((o) => (
                <tr key={o.id}>
                  <td>{numeroProtocolo(o.protocolo).replace("#", "")}</td>
                  <td>{dataCurta(o.criado_em)}</td>
                  <td>{o.categoria.nome.split(" ")[0]}</td>
                  <td>{o.endereco}</td>
                  <td><Selo status={o.status} urgencia={o.nivel_urgencia} /></td>
                  <td>{o.categoria.secretaria?.sigla}</td>
                  <td>{dataCurta(o.prazo_sla)}</td>
                  <td className="text-end text-nowrap">
                    {!encerrada(o.status) && (
                      <button className="btn btn-success btn-sm me-1" onClick={() => aoAtualizar(o)}>Status</button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navegar(`/ocorrencia/${o.id}`)}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lista.length === 0 && <p className="text-center text-muted py-4 mb-0">Nenhuma ocorrência encontrada.</p>}
      </div>
    </>
  );
}
