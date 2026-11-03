import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CitizenLayout from "../components/CitizenLayout";
import AdminTopbar from "../components/AdminTopbar";
import Icon from "../components/Icon";
import MapView from "../components/MapView";
import { useToast } from "../components/Toast";
import {
  corBarra,
  encerrada,
  formatarData,
  formatarDataHora,
  infoStatus,
  mensagemErro,
  protocoloCurto,
  rotuloUrgencia,
} from "../utils/format";

interface Historico {
  id: string;
  status_anterior: string;
  status_novo: string;
  criado_em: string;
}

interface Detalhe {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  nivel_urgencia: string;
  foto_url: string | null;
  prazo_sla: string;
  criado_em: string;
  categoria: { nome: string; icone: string; secretaria?: { nome: string } };
  endereco: string;
  latitude: number;
  longitude: number;
  equipeCampo: { nome: string } | null;
  cidadao: { nome: string; email: string } | null;
  historicos: Historico[];
  confirmacoes_total: number;
  ja_confirmei: boolean;
}

const ORIGEM_API = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
const ORDEM = ["registrada", "em_analise", "encaminhada", "em_execucao", "concluida"];

interface Passo {
  titulo: string;
  estado: "feito" | "atual" | "espera" | "negado";
  data?: string;
  texto: string;
}

// Monta a linha do tempo do protótipo a partir do status atual e do histórico
function montarPassos(d: Detalhe): Passo[] {
  const indice = ORDEM.indexOf(d.status);
  const dataDe = (...status: string[]) => d.historicos.find((h) => status.includes(h.status_novo))?.criado_em;
  const secretaria = d.categoria.secretaria?.nome ?? "secretaria responsável";

  const triagem = dataDe("encaminhada", "em_execucao", "concluida");
  const campo = dataDe("em_execucao", "concluida");
  const fim = dataDe("concluida", "indeferida");

  const passos: Passo[] = [
    {
      titulo: "Notificação recebida",
      estado: "feito",
      data: formatarDataHora(d.criado_em),
      texto: `Protocolo ${protocoloCurto(d.protocolo)} gerado com sucesso.`,
    },
    {
      titulo: "Triagem e encaminhamento",
      estado: indice >= 2 || d.status === "indeferida" ? "feito" : indice === 1 ? "atual" : "espera",
      data: triagem ? formatarDataHora(triagem) : undefined,
      texto: indice >= 2 ? `Encaminhado à ${secretaria}.` : "Aguardando análise da prefeitura.",
    },
  ];

  if (d.status !== "indeferida") {
    passos.push({
      titulo: "Equipe em campo",
      estado: indice >= 4 ? "feito" : indice >= 2 ? "atual" : "espera",
      data: campo ? formatarDataHora(campo) : undefined,
      texto: d.equipeCampo
        ? `${d.equipeCampo.nome} designada. Previsão: ${formatarData(d.prazo_sla)}.`
        : `Previsão: ${formatarData(d.prazo_sla)}.`,
    });
    passos.push({
      titulo: "Resolução e encerramento",
      estado: indice >= 4 ? "feito" : "espera",
      data: fim ? formatarDataHora(fim) : undefined,
      texto: indice >= 4 ? "Problema resolvido." : `Previsão: ${formatarData(d.prazo_sla)}.`,
    });
  } else {
    passos.push({
      titulo: "Notificação indeferida",
      estado: "negado",
      data: fim ? formatarDataHora(fim) : undefined,
      texto: "A prefeitura encerrou esta notificação sem execução.",
    });
  }

  return passos;
}

function Estrutura({ admin, children }: { admin: boolean; children: ReactNode }) {
  if (admin) {
    return (
      <div className="cc-pagina">
        <AdminTopbar />
        {children}
      </div>
    );
  }

  return <CitizenLayout>{children}</CitizenLayout>;
}

export default function DetalheOcorrencia() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { usuario } = useAuth();
  const aviso = useToast();
  const [dados, setDados] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState("");

  const ehAdmin = usuario?.tipo === "administrador";

  useEffect(() => {
    api
      .get(`/ocorrencias/${id}`)
      .then((resposta) => setDados(resposta.data))
      .catch((e) => setErro(mensagemErro(e, "Não foi possível carregar a notificação.")));
  }, [id]);

  async function confirmar() {
    try {
      const resposta = await api.post(`/ocorrencias/${id}/confirmar`);
      setDados((atual) =>
        atual ? { ...atual, confirmacoes_total: resposta.data.total, ja_confirmei: resposta.data.confirmado } : atual
      );
      aviso(resposta.data.confirmado ? "Confirmação registrada." : "Confirmação removida.");
    } catch (e) {
      aviso(mensagemErro(e, "Não foi possível confirmar."), "erro");
    }
  }

  if (erro) {
    return (
      <Estrutura admin={ehAdmin}>
        <div className="cc-conteudo">
          <div className="cc-erro">{erro}</div>
        </div>
      </Estrutura>
    );
  }

  if (!dados) {
    return (
      <Estrutura admin={ehAdmin}>
        <div className="cc-vazio">
          <span className="cc-spinner" />
        </div>
      </Estrutura>
    );
  }

  const info = infoStatus(dados.status);
  const cor = corBarra(dados.status, dados.nivel_urgencia);
  const urgente = dados.nivel_urgencia === "alta" && !encerrada(dados.status);
  const passos = montarPassos(dados);

  return (
    <Estrutura admin={ehAdmin}>
      <div className="cc-faixa">
        <button className="cc-voltar" onClick={() => navegar(-1)}>
          <Icon nome="voltar" />
          Voltar
        </button>
        <div className="cc-faixa-cat">{dados.categoria.nome}</div>
        <div className="cc-faixa-titulo">
          {dados.categoria.nome} em {dados.endereco}
        </div>
        <div className="cc-chips">
          <div className="cc-chip">
            {urgente && <i />}
            {urgente ? "Urgente" : rotuloUrgencia(dados.nivel_urgencia)}
          </div>
          <div className="cc-chip">Ji-Paraná, RO</div>
          <div className="cc-chip">Reportado em {formatarData(dados.criado_em)}</div>
          <div className="cc-chip">Protocolo {protocoloCurto(dados.protocolo)}</div>
        </div>
      </div>

      <div className="cc-detalhe">
        <div>
          <h3>Acompanhamento</h3>
          <div className="cc-linha-tempo">
            {passos.map((passo, indice) => (
              <div className="cc-passo" key={passo.titulo}>
                <div className="cc-passo-trilho">
                  <div className={`cc-passo-marca ${passo.estado}`}>
                    <Icon
                      nome={passo.estado === "feito" ? "check" : passo.estado === "negado" ? "cruz" : "engrenagemPequena"}
                    />
                  </div>
                  {indice < passos.length - 1 && <div className="cc-passo-linha" />}
                </div>
                <div className={`cc-passo-texto ${passo.estado === "atual" ? "atual" : passo.estado === "espera" ? "espera" : ""}`}>
                  <b>{passo.titulo}</b>
                  {passo.data && <>{passo.data}<br /></>}
                  {passo.texto}
                </div>
              </div>
            ))}
          </div>

          <div className="cc-info">
            <div><small>Protocolo</small><strong className="verde">{protocoloCurto(dados.protocolo)}</strong></div>
            <div><small>Secretaria</small><strong>{dados.categoria.secretaria?.nome ?? "-"}</strong></div>
            <div><small>Confirmações</small><strong className="verde">{dados.confirmacoes_total} cidadãos</strong></div>
            <div><small>Prazo resposta</small><strong>{formatarData(dados.prazo_sla)}</strong></div>
          </div>

          {!ehAdmin && !encerrada(dados.status) && (
            <button className={`cc-btn ${dados.ja_confirmei ? "" : "cc-btn-claro"}`} style={{ width: "100%" }} onClick={confirmar}>
              <Icon nome="curtir" />
              {dados.ja_confirmei ? "Você confirmou que o problema persiste" : "Confirmar que o problema persiste"}
            </button>
          )}
          {ehAdmin && dados.cidadao && (
            <div className="cc-descricao" style={{ marginTop: 14 }}>
              <small style={{ color: "#6b7280" }}>Cidadão (visível só para administradores)</small>
              <br />
              <strong>{dados.cidadao.nome}</strong> · {dados.cidadao.email}
            </div>
          )}
        </div>

        <div>
          <h3>Descrição</h3>
          <div className="cc-descricao">{dados.descricao}</div>

          <h3>Registro fotográfico</h3>
          <div className="cc-foto" style={{ marginBottom: 22 }}>
            {dados.foto_url ? (
              <img src={`${ORIGEM_API}${dados.foto_url}`} alt="Foto enviada pelo cidadão" />
            ) : (
              <div>
                <Icon nome="camera" />
                <div style={{ marginTop: 6 }}>Nenhuma foto enviada</div>
              </div>
            )}
          </div>

          <h3>Localização</h3>
          <div className="cc-localizacao">
            <MapView
              zoom={16}
              centro={[Number(dados.latitude), Number(dados.longitude)]}
              pontos={[
                {
                  id: dados.id,
                  latitude: Number(dados.latitude),
                  longitude: Number(dados.longitude),
                  status: dados.status,
                  urgencia: dados.nivel_urgencia,
                  titulo: dados.categoria.nome,
                  subtitulo: dados.endereco,
                },
              ]}
            />
          </div>

          <div className="cc-progresso">
            <div className="topo">
              <span>Progresso de resolução</span>
              <span>{info.progresso}%</span>
            </div>
            <div className="cc-barra" style={{ background: cor.fraca }}>
              <div style={{ width: `${info.progresso}%`, background: cor.forte }} />
            </div>
            <div style={{ fontSize: 14, marginTop: 18 }}>Etapa atual: {info.etapa}</div>
          </div>

          {ehAdmin && (
            <p style={{ marginTop: 16 }}>
              <Link to="/admin" className="cc-link">
                Voltar ao painel administrativo
              </Link>
            </p>
          )}
        </div>
      </div>
    </Estrutura>
  );
}
