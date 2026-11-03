import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

interface Ocorrencia {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  prazo_sla: string;
  criado_em: string;
  categoria: { nome: string };
}

const ROTULOS_STATUS: Record<string, string> = {
  registrada: "Registrada",
  em_analise: "Em análise",
  encaminhada: "Encaminhada",
  em_execucao: "Em execução",
  concluida: "Concluída",
  indeferida: "Indeferida",
};

export default function MinhasOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get("/ocorrencias/minhas")
      .then((resposta) => setOcorrencias(resposta.data))
      .catch(() => setErro("Não foi possível carregar suas ocorrências"))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="container" style={{ maxWidth: "720px", marginTop: "40px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">Minhas ocorrências</h1>
        <Link to="/notificar" className="btn btn-primary btn-sm">
          Notificar problema
        </Link>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {carregando ? (
        <p className="text-muted">Carregando...</p>
      ) : ocorrencias.length === 0 ? (
        <p className="text-muted">Você ainda não registrou nenhuma ocorrência.</p>
      ) : (
        <div className="list-group">
          {ocorrencias.map((ocorrencia) => (
            <div key={ocorrencia.id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <strong>{ocorrencia.protocolo}</strong>
                <span className="badge bg-secondary">
                  {ROTULOS_STATUS[ocorrencia.status] || ocorrencia.status}
                </span>
              </div>
              <div className="small text-muted">{ocorrencia.categoria?.nome}</div>
              <p className="mb-1">{ocorrencia.descricao}</p>
              <div className="small text-muted">
                Prazo estimado: {new Date(ocorrencia.prazo_sla).toLocaleDateString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
