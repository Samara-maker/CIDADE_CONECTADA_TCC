import { useState } from "react";
import api from "../../services/api";
import Janela from "../../components/Janela";
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
    <Janela
      titulo="Atualizar status da ocorrência"
      aoFechar={aoFechar}
      rodape={
        <>
          <button className="btn btn-outline-secondary" onClick={aoFechar}>Cancelar</button>
          <button className="btn btn-success" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar e notificar cidadão"}
          </button>
        </>
      }
    >
      <p className="text-muted">
        Protocolo <b>{protocoloCurto(ocorrencia.protocolo)}</b>. O cidadão será notificado automaticamente.
      </p>

      <div className="mb-3">
        <label className="form-label fw-semibold">Novo status</label>
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPCOES.map((s) => (
            <option key={s.valor} value={s.valor}>{s.rotulo}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Secretaria responsável</label>
        <select className="form-select" value={secretaria} disabled>
          <option>{secretaria || "Não definida"}</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Equipe designada</label>
        <select className="form-select" value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
          <option value="">Selecione...</option>
          {equipesDaSecretaria.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label fw-semibold">Prazo</label>
          <input type="date" className="form-control" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label fw-semibold">Prioridade</label>
          <select className="form-select" value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
            <option value="alta">Urgente</option>
            <option value="media">Moderado</option>
            <option value="baixa">Baixo</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Observação interna (só admin)</label>
        <textarea className="form-control" rows={3} placeholder="Visível apenas para administradores..." value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      </div>

      <div>
        <label className="form-label fw-semibold">Mensagem ao cidadão (e-mail)</label>
        <textarea className="form-control" rows={3} placeholder="Ex: Sua ocorrência foi atendida. Equipe designada." value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      </div>
    </Janela>
  );
}
