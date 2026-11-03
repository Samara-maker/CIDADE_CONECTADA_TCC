import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { STATUS_OPCOES, dataCurta, encerrada, numeroProtocolo, selo } from "../../utils/format";
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
      <div className="cc-admin-cab">
        <div>
          <h1 className="cc-titulo">Todas as Ocorrências</h1>
          <p className="cc-subtitulo" style={{ fontSize: 14 }}>{ativas} ativas · ordenadas por urgência</p>
        </div>
        <div className="cc-admin-ferr">
          <div className="cc-busca-adm">
            <input placeholder="Pesquise aqui" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <Icon nome="busca" />
          </div>
          <select className="cc-select-adm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_OPCOES.map((s) => (
              <option key={s.valor} value={s.valor}>{s.rotulo}</option>
            ))}
          </select>
          <select className="cc-select-adm" value={secretaria} onChange={(e) => setSecretaria(e.target.value)}>
            <option value="">Todas secretarias</option>
            {secretarias.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cc-tabela-wrap">
        <table className="cc-tabela">
          <thead>
            <tr><th>#</th><th>Data</th><th>Categoria</th><th>Endereço</th><th>Status</th><th>Secretaria</th><th>SLA</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {lista.map((o) => {
              const etiqueta = selo(o.status, o.nivel_urgencia);
              return (
                <tr key={o.id}>
                  <td>{numeroProtocolo(o.protocolo).replace("#", "")}</td>
                  <td>{dataCurta(o.criado_em)}</td>
                  <td>{o.categoria.nome.split(" ")[0]}</td>
                  <td>{o.endereco}</td>
                  <td><span className={`cc-pill-tabela ${etiqueta.classe}`}>{etiqueta.rotulo}</span></td>
                  <td>{o.categoria.secretaria?.sigla}</td>
                  <td>{dataCurta(o.prazo_sla)}</td>
                  <td>
                    <div className="cc-acao-tab">
                      {!encerrada(o.status) && <button className="cc-btn-tab" onClick={() => aoAtualizar(o)}>Status</button>}
                      <button className="cc-btn-ver" onClick={() => navegar(`/ocorrencia/${o.id}`)}>Ver</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && <div className="cc-vazio">Nenhuma ocorrência encontrada.</div>}
      </div>
    </>
  );
}
