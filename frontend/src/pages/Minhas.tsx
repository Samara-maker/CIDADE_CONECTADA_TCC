import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import CitizenLayout from "../components/CitizenLayout";
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
      <div className="cc-conteudo">
        <h1 className="cc-titulo">Minhas Notificações</h1>
        <p className="cc-subtitulo" style={{ marginBottom: 26 }}>
          {usuario?.nome} - {lista.length} {lista.length === 1 ? "notificação enviada" : "notificações enviadas"}
        </p>

        <div className="cc-lista" style={{ gap: 12 }}>
          {carregando && (
            <div className="cc-vazio">
              <span className="cc-spinner" />
            </div>
          )}
          {!carregando && lista.length === 0 && (
            <div className="cc-vazio">
              Você ainda não enviou nenhuma notificação.{" "}
              <Link to="/nova" className="cc-link">
                Notificar um problema
              </Link>
            </div>
          )}

          {lista.map((item) => {
            const info = infoStatus(item.status);
            const cor = corBarra(item.status, item.nivel_urgencia);

            return (
              <div key={item.id} className="cc-minha" onClick={() => navegar(`/ocorrencia/${item.id}`)}>
                <div className="cc-minha-esq">
                  <div className="cc-item-titulo">{tituloOcorrencia(item)}</div>
                  <div className="cc-item-meta">
                    {item.categoria.nome}
                    <strong>Municipal</strong>
                  </div>
                  <div className="cc-barra fina" style={{ background: cor.fraca }}>
                    <div style={{ width: `${info.progresso}%`, background: cor.forte }} />
                  </div>
                </div>

                <div className="cc-minha-dir">
                  <Selo status={item.status} urgencia={item.nivel_urgencia} />
                  {item.status === "concluida" && (
                    <button
                      className="cc-btn-avaliar"
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
            );
          })}
        </div>
      </div>

      {avaliando && (
        <div className="cc-fundo" onClick={() => setAvaliando(null)}>
          <div className="cc-janela" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-janela-miolo">
              <button className="cc-fechar" onClick={() => setAvaliando(null)}>
                <Icon nome="cruz" tamanho={16} />
              </button>
              <h3 style={{ fontSize: 24, marginBottom: 10, paddingRight: 40 }}>Como foi a resolução?</h3>
              <p style={{ fontSize: 17, color: "#4b5563" }}>
                Ocorrência: {tituloOcorrencia(avaliando)}.
                <br />
                Sua nota ajuda a prefeitura a melhorar o atendimento.
              </p>

              <div className="cc-faces">
                {NOTAS.map((opcao) => (
                  <button
                    key={opcao.valor}
                    className={`cc-face ${nota === opcao.valor ? "ativa" : ""}`}
                    onClick={() => setNota(opcao.valor)}
                  >
                    <Icon nome={opcao.icone} />
                    {opcao.rotulo}
                  </button>
                ))}
              </div>

              <label className="cc-label" style={{ fontWeight: 700 }}>
                Conte mais (opcional)
              </label>
              <textarea
                className="cc-textarea"
                placeholder="O que podemos melhorar no atendimento?"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                style={{ background: "#f3f6f3" }}
              />
              <button className="cc-btn cc-btn-bloco" style={{ marginTop: 18, borderRadius: 14, background: "#1f6e4f", fontSize: 15 }} onClick={enviarAvaliacao}>
                Enviar avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}
