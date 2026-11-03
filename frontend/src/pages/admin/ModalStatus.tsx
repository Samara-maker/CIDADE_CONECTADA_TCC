import { useState } from "react";
import api from "../../services/api";
import Icon from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { STATUS_OPCOES, mensagemErro, protocoloCurto } from "../../utils/format";
import { Equipe, OcorrenciaAdmin } from "./tipos";

interface Props {
  ocorrencia: OcorrenciaAdmin;
  equipes: Equipe[];
  aoFechar: () => void;
  aoSalvar: () => void;
}

export default function ModalStatus({ ocorrencia, equipes, aoFechar, aoSalvar }: Props) {
  const aviso = useToast();
  const [status, setStatus] = useState(ocorrencia.status);
  const [equipeId, setEquipeId] = useState(ocorrencia.equipeCampo?.id ?? "");
  const [prazo, setPrazo] = useState(String(ocorrencia.prazo_sla).substring(0, 10));
  const [urgencia, setUrgencia] = useState(ocorrencia.nivel_urgencia);
  const [observacao, setObservacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  const secretaria = ocorrencia.categoria.secretaria?.nome ?? "";
  const equipesDaSecretaria = equipes.filter((e) => e.ativa && (!secretaria || e.secretaria === secretaria));

  async function salvar() {
    setSalvando(true);
    try {
      await api.patch(`/ocorrencias/${ocorrencia.id}/status`, {
        status,
        equipe_id: equipeId || null,
        prazo_sla: prazo,
        nivel_urgencia: urgencia,
        observacao,
        mensagem,
      });
      aviso("Ocorrência atualizada e cidadão notificado.");
      aoSalvar();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível salvar as alterações."), "erro");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="cc-fundo" onClick={aoFechar}>
      <div className="cc-janela" style={{ width: 470 }} onClick={(e) => e.stopPropagation()}>
        <div className="cc-janela-miolo" style={{ padding: "14px 22px 8px" }}>
          <button className="cc-fechar" onClick={aoFechar} style={{ top: 14, right: 14 }}>
            <Icon nome="cruz" tamanho={14} />
          </button>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>Atualizar Status da Ocorrência</h3>
          <p style={{ fontSize: 15 }}>
            Protocolo <b>{protocoloCurto(ocorrencia.protocolo)}</b> · Cidadão será notificado automaticamente.
          </p>

          <div className="cc-campo" style={{ marginBottom: 12 }}>
            <label className="cc-label" style={{ fontWeight: 600 }}>Novo Status *</label>
            <select className="cc-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPCOES.map((s) => (
                <option key={s.valor} value={s.valor}>{s.rotulo}</option>
              ))}
            </select>
          </div>

          <div className="cc-campo" style={{ marginBottom: 12 }}>
            <label className="cc-label" style={{ fontWeight: 600 }}>Secretaria Responsável</label>
            <select className="cc-select" value={secretaria} disabled>
              <option>{secretaria || "Não definida"}</option>
            </select>
          </div>

          <div className="cc-campo" style={{ marginBottom: 12 }}>
            <label className="cc-label" style={{ fontWeight: 600 }}>Equipe Designada</label>
            <select className="cc-select" value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
              <option value="">Selecione...</option>
              {equipesDaSecretaria.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          </div>

          <div className="cc-grid-2" style={{ gap: 12 }}>
            <div className="cc-campo" style={{ marginBottom: 12 }}>
              <label className="cc-label" style={{ fontWeight: 600 }}>Prazo</label>
              <input type="date" className="cc-input" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
            <div className="cc-campo" style={{ marginBottom: 12 }}>
              <label className="cc-label" style={{ fontWeight: 600 }}>Prioridade</label>
              <select className="cc-select" value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                <option value="alta">Urgente</option>
                <option value="media">Moderado</option>
                <option value="baixa">Baixo</option>
              </select>
            </div>
          </div>

          <div className="cc-campo" style={{ marginBottom: 12 }}>
            <label className="cc-label" style={{ fontWeight: 600 }}>Observação interna (só admin)</label>
            <textarea className="cc-textarea" style={{ minHeight: 70 }} placeholder="Visível apenas para administradores..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>

          <div className="cc-campo" style={{ marginBottom: 6 }}>
            <label className="cc-label" style={{ fontWeight: 600 }}>Mensagem ao cidadão (e-mail)</label>
            <textarea className="cc-textarea" style={{ minHeight: 70 }} placeholder="Ex: Sua ocorrência foi atendida. Equipe designada. Previsão: 12/08/2026." value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
          </div>
        </div>

        <div className="cc-janela-acoes">
          <button className="cc-btn cc-btn-claro" style={{ minWidth: 150, fontSize: 13 }} onClick={aoFechar}>Cancelar</button>
          <button className="cc-btn cc-btn-escuro" style={{ minWidth: 190, fontSize: 13 }} onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar e Notificar Cidadão"}
          </button>
        </div>
      </div>
    </div>
  );
}
