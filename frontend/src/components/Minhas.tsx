import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import CitizenLayout from "../components/CitizenLayout";
import Janela from "../components/Janela";
import Icon from "../components/Icon";
import Selo from "../components/Selo";
import { OcorrenciaPublica } from "../utils/tipos";
import { corBarra, infoStatus, mensagemErro, tituloOcorrencia } from "../utils/format";

type Item = OcorrenciaPublica & { avaliada: boolean };

const NOTAS = [
  { valor: 1, rotulo: "Insatisfeito", icone: "triste" },
  { valor: 2, rotulo: "Neutro", icone: "neutro" },
  { valor: 3, rotulo: "Satisfeito", icone: "feliz" },
  { valor: 4, rotulo: "Muito satisfeito", icone: "muitoFeliz" },
];

export default function Minhas() {
  const navegar = useNavigate();
  const { usuario } = useAuth();
  const aviso = useToast();
  const [lista, setLista] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [avaliando, setAvaliando] = useState<Item | null>(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  function carregar() {
    api
      .get("/ocorrencias/minhas")
      .then((r) => setLista(r.data))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function abrirAvaliacao(item: Item) {
    setAvaliando(item);
    setNota(0);
    setComentario("");
  }

  async function enviarAvaliacao() {
    if (!avaliando) return;

    if (!nota) {
      aviso("Escolha uma das opções de satisfação.", "erro");
      return;
    }

    try {
      await api.post(`/ocorrencias/${avaliando.id}/avaliar`, { nota, comentario });
      aviso("Avaliação enviada. Obrigado!");
      setAvaliando(null);
      carregar();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível enviar a avaliação."), "erro");
    }
  }

  return (
    <CitizenLayout>
      <div className="container py-4">
        <h1 className="h3 mb-1">Minhas notificações</h1>
        <p className="text-muted mb-4">
          {usuario?.nome} · {lista.length} {lista.length === 1 ? "notificação enviada" : "notificações enviadas"}
        </p>

        {carregando && <div className="spinner-border text-success" />}
        {!carregando && lista.length === 0 && (
          <div className="alert alert-light border">
            Você ainda não enviou nenhuma notificação.{" "}
            <Link to="/nova" className="text-success">
              Notificar um problema
            </Link>
          </div>
        )}

        <div className="vstack gap-2">
          {lista.map((item) => {
            const info = infoStatus(item.status);
            const cor = corBarra(item.status, item.nivel_urgencia);

            return (
              <div key={item.id} className="card shadow-sm" role="button" onClick={() => navegar(`/ocorrencia/${item.id}`)}>
                <div className="card-body d-flex justify-content-between align-items-center gap-3">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{tituloOcorrencia(item)}</div>
                    <small className="text-muted">{item.categoria.nome} · Municipal</small>
                    <div className="progress mt-2" style={{ height: 6 }}>
                      <div className="progress-bar" style={{ width: `${info.progresso}%`, background: cor.forte }} />
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-end gap-2">
                    <Selo status={item.status} urgencia={item.nivel_urgencia} />
                    {item.status === "concluida" && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        disabled={item.avaliada}
                        onClick={(evento) => {
                          evento.stopPropagation();
                          abrirAvaliacao(item);
                        }}
                      >
                        {item.avaliada ? "Avaliada" : "Avaliar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {avaliando && (
        <Janela
          titulo="Como foi a resolução?"
          aoFechar={() => setAvaliando(null)}
          rodape={
            <button className="btn btn-success w-100" onClick={enviarAvaliacao}>
              Enviar avaliação
            </button>
          }
        >
          <p className="text-muted">
            Ocorrência: {tituloOcorrencia(avaliando)}. Sua nota ajuda a prefeitura a melhorar o atendimento.
          </p>

          <div className="row g-2 mb-3">
            {NOTAS.map((opcao) => (
              <div key={opcao.valor} className="col-6">
                <button
                  type="button"
                  className={`btn w-100 ${nota === opcao.valor ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => setNota(opcao.valor)}
                >
                  <Icon nome={opcao.icone} tamanho={26} />
                  <div className="small mt-1">{opcao.rotulo}</div>
                </button>
              </div>
            ))}
          </div>

          <label className="form-label">Conte mais (opcional)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="O que podemos melhorar no atendimento?"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </Janela>
      )}
    </CitizenLayout>
  );
}
