import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { horasDesde, mensagemErro, protocoloCurto, rotuloUrgencia } from "../../utils/format";
import { Equipe, OcorrenciaAdmin } from "./tipos";

interface Props {
  ocorrencias: OcorrenciaAdmin[];
  equipes: Equipe[];
  aoMudar: () => void;
}

export default function Triagem({ ocorrencias, equipes, aoMudar }: Props) {
  const aviso = useToast();
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});

  const pendentes = ocorrencias
    .filter((o) => o.status === "registrada" || o.status === "em_analise")
    .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

  const atrasadas = pendentes.filter((o) => horasDesde(o.criado_em) > 24).length;

  async function confirmar(o: OcorrenciaAdmin) {
    try {
      await api.patch(`/ocorrencias/${o.id}/status`, {
        status: "encaminhada",
        equipe_id: escolhas[o.id] || null,
        mensagem: `Sua notificação foi encaminhada à ${o.categoria.secretaria?.nome ?? "secretaria responsável"}.`,
      });
      aviso("Notificação encaminhada.");
      aoMudar();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível encaminhar."), "erro");
    }
  }

  async function cancelar(o: OcorrenciaAdmin) {
    if (!window.confirm("Indeferir esta notificação? O cidadão será avisado.")) return;

    try {
      await api.patch(`/ocorrencias/${o.id}/status`, { status: "indeferida" });
      aviso("Notificação indeferida.");
      aoMudar();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível indeferir."), "erro");
    }
  }

  return (
    <>
      <div className="mb-3">
        <h1 className="h3 mb-0">Triagem pendente</h1>
        <small className="text-muted">{pendentes.length} ocorrências aguardando classificação</small>
      </div>

      {atrasadas > 0 && (
        <div className="alert alert-warning">Atenção: há ocorrências há mais de 24h sem triagem.</div>
      )}

      {pendentes.length === 0 && <p className="text-center text-muted py-4">Nenhuma ocorrência aguardando triagem.</p>}

      <div className="list-group shadow-sm">
        {pendentes.map((o) => {
          const horas = horasDesde(o.criado_em);
          const opcoes = equipes.filter((e) => e.ativa && e.secretaria === o.categoria.secretaria?.nome);
          return (
            <div key={o.id} className="list-group-item">
              <div className="row align-items-center g-2">
                <div className="col-lg-6">
                  <div className="fw-semibold">
                    {protocoloCurto(o.protocolo)} · {o.categoria.nome}, {o.endereco}
                  </div>
                  <small className="text-muted">
                    Há <span className="text-danger fw-semibold">{horas}h</span> sem triagem · {rotuloUrgencia(o.nivel_urgencia)}
                  </small>
                </div>
                <div className="col-lg-6">
                  <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                    <select
                      className="form-select w-auto"
                      value={escolhas[o.id] ?? ""}
                      onChange={(e) => setEscolhas({ ...escolhas, [o.id]: e.target.value })}
                    >
                      <option value="">Encaminhar...</option>
                      {opcoes.map((e) => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                    <button className="btn btn-success" onClick={() => confirmar(o)}>Confirmar</button>
                    <button className="btn btn-outline-danger" onClick={() => cancelar(o)}>Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
