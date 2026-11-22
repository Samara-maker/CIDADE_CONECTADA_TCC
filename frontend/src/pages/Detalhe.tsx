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

const COR_PASSO = { feito: "bg-success", atual: "bg-warning", espera: "bg-secondary", negado: "bg-danger" };

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
        <div className="container py-4">
          <div className="alert alert-danger">{erro}</div>
        </div>
      </Estrutura>
    );
  }

  if (!dados) {
    return (
      <Estrutura admin={ehAdmin}>
        <div className="text-center py-5">
          <div className="spinner-border text-success" />
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
      <div className="bg-success text-white py-4">
        <div className="container">
          <button className="btn btn-sm btn-light mb-3" onClick={() => navegar(-1)}>
            Voltar
          </button>
          <div className="small opacity-75">{dados.categoria.nome}</div>
          <h1 className="h3">
            {dados.categoria.nome} em {dados.endereco}
          </h1>
          <div className="d-flex flex-wrap gap-2">
            <span className={`badge ${urgente ? "bg-danger" : "bg-light text-dark"}`}>
              {urgente ? "Urgente" : rotuloUrgencia(dados.nivel_urgencia)}
            </span>
            <span className="badge bg-light text-dark">Ji-Paraná, RO</span>
            <span className="badge bg-light text-dark">Reportado em {formatarData(dados.criado_em)}</span>
            <span className="badge bg-light text-dark">Protocolo {protocoloCurto(dados.protocolo)}</span>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <h2 className="h5 mb-3">Acompanhamento</h2>
            <ol className="list-unstyled">
              {passos.map((passo) => (
                <li key={passo.titulo} className="d-flex gap-3 mb-3">
                  <span
                    className={`rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0 ${COR_PASSO[passo.estado]}`}
                    style={{ width: 32, height: 32 }}
                  >
                    <Icon nome={passo.estado === "feito" ? "check" : passo.estado === "negado" ? "cruz" : "engrenagemPequena"} tamanho={16} />
                  </span>
                  <div className={passo.estado === "espera" ? "text-muted" : ""}>
                    <div className="fw-semibold">{passo.titulo}</div>
                    {passo.data && <div className="small">{passo.data}</div>}
                    <div className="small">{passo.texto}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <small className="text-muted d-block">Protocolo</small>
                <strong className="text-success">{protocoloCurto(dados.protocolo)}</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Secretaria</small>
                <strong>{dados.categoria.secretaria?.nome ?? "-"}</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Confirmações</small>
                <strong className="text-success">{dados.confirmacoes_total} cidadãos</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Prazo de resposta</small>
                <strong>{formatarData(dados.prazo_sla)}</strong>
              </div>
            </div>

            {!ehAdmin && !encerrada(dados.status) && (
              <button className={`btn w-100 ${dados.ja_confirmei ? "btn-success" : "btn-outline-success"}`} onClick={confirmar}>
                {dados.ja_confirmei ? "Você confirmou que o problema persiste" : "Confirmar que o problema persiste"}
              </button>
            )}
            {ehAdmin && dados.cidadao && (
              <div className="alert alert-light border">
                <small className="text-muted">Cidadão (visível só para administradores)</small>
                <br />
                <strong>{dados.cidadao.nome}</strong> · {dados.cidadao.email}
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <h2 className="h5 mb-3">Descrição</h2>
            <div className="card mb-4">
              <div className="card-body">{dados.descricao}</div>
            </div>

            <h2 className="h5 mb-3">Registro fotográfico</h2>
            <div className="mb-4">
              {dados.foto_url ? (
                <img src={`${ORIGEM_API}${dados.foto_url}`} alt="Foto enviada pelo cidadão" className="img-fluid rounded" />
              ) : (
                <div className="border rounded text-center text-muted py-4">Nenhuma foto enviada</div>
              )}
            </div>

            <h2 className="h5 mb-3">Localização</h2>
            <div className="border rounded overflow-hidden mb-4" style={{ height: 260 }}>
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

            <div className="d-flex justify-content-between small mb-1">
              <span>Progresso de resolução</span>
              <strong>{info.progresso}%</strong>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${info.progresso}%`, background: cor.forte }} />
            </div>
            <div className="small mt-2">Etapa atual: {info.etapa}</div>

            {ehAdmin && (
              <p className="mt-3">
                <Link to="/admin" className="text-success">
                  Voltar ao painel administrativo
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </Estrutura>
  );
}
