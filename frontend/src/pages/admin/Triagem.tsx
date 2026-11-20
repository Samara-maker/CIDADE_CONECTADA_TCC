import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import Icon from "../../components/Icon";
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
      <div className="cc-admin-cab" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="cc-titulo">Triagem Pendente</h1>
          <p className="cc-subtitulo" style={{ fontSize: 14 }}>{pendentes.length} ocorrências aguardando classificação</p>
        </div>
      </div>

      {atrasadas > 0 && (
        <div className="cc-alerta">
          <Icon nome="alerta" />
          Atenção: Há ocorrências há mais de 24h sem triagem.
        </div>
      )}

      <div className="cc-triagem">
        {pendentes.length === 0 && <div className="cc-vazio">Nenhuma ocorrência aguardando triagem.</div>}
        {pendentes.map((o) => {
          const horas = horasDesde(o.criado_em);
          const opcoes = equipes.filter((e) => e.ativa && e.secretaria === o.categoria.secretaria?.nome);
          return (
            <div key={o.id} className="cc-triagem-item">
              <div>
                  <b>{protocoloCurto(o.protocolo)} · {o.categoria.nome}, {o.endereco}</b>                <div className="meta">
                  Há <em>{horas}h</em> sem triagem · {rotuloUrgencia(o.nivel_urgencia)}
                </div>
              </div>
              <div className="cc-triagem-acoes">
                <select
                  className="cc-select-adm"
                  value={escolhas[o.id] ?? ""}
                  onChange={(e) => setEscolhas({ ...escolhas, [o.id]: e.target.value })}
                >
                  <option value="">Encaminhar...</option>
                  {opcoes.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <button className="cc-btn cc-btn-ok" onClick={() => confirmar(o)}>Confirmar</button>
                <button className="cc-btn cc-btn-risco" onClick={() => cancelar(o)}>Cancelar</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
