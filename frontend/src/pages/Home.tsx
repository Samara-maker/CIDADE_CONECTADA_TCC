import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Icon from "../components/Icon";
import Selo from "../components/Selo";
import MapView, { PontoMapa } from "../components/MapView";
import { OcorrenciaPublica, Resumo } from "../utils/tipos";
import { corCategoria, formatarDias, tituloOcorrencia } from "../utils/format";

export default function Home() {
  const navegar = useNavigate();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaPublica[]>([]);
  const [categoria, setCategoria] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.get("/publico/resumo"), api.get("/publico/ocorrencias")])
      .then(([r, o]) => {
        setResumo(r.data);
        setOcorrencias(o.data);
      })
      .catch(() => setErro("Não foi possível carregar os dados. Confira se o backend está rodando."))
      .finally(() => setCarregando(false));
  }, []);

  const recentes = useMemo(
    () => ocorrencias.filter((item) => !categoria || item.categoria.id === categoria).slice(0, 5),
    [ocorrencias, categoria]
  );

  const pontos: PontoMapa[] = useMemo(
    () =>
      ocorrencias.map((item) => ({
        id: item.id,
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        status: item.status,
        urgencia: item.nivel_urgencia,
        titulo: item.categoria.nome,
        subtitulo: item.endereco,
      })),
    [ocorrencias]
  );

  const ano = new Date().getFullYear();

  return (
    <CitizenLayout>
      <div className="cc-conteudo">
        {erro && <div className="cc-erro">{erro}</div>}

        <div className="cc-stats">
          <div className="cc-stat verde">
            <div className="cc-stat-num">{resumo?.abertas ?? "-"}</div>
            <div className="cc-stat-rot">Notificações abertas</div>
          </div>
          <div className="cc-stat amarelo">
            <div className="cc-stat-num">{resumo?.em_resolucao ?? "-"}</div>
            <div className="cc-stat-rot">Em andamento</div>
          </div>
          <div className="cc-stat verde">
            <div className="cc-stat-num">{resumo?.resolvidas ?? "-"}</div>
            <div className="cc-stat-rot">Resolvidos ({ano})</div>
          </div>
          <div className="cc-stat azul">
            <div className="cc-stat-num">{resumo ? formatarDias(resumo.tempo_medio_dias) : "-"}</div>
            <div className="cc-stat-rot">Tempo médio de resposta</div>
          </div>
        </div>

        <div className="cc-divisao">
          <div>
            <h2 className="cc-secao">
              <Icon nome="check" />
              Notificações Recentes
            </h2>

            <div className="cc-filtros">
              <button className={`cc-filtro ${categoria === "" ? "ativo" : ""}`} onClick={() => setCategoria("")}>
                Todos
              </button>
              {resumo?.por_categoria.map((item) => (
                <button
                  key={item.id}
                  className={`cc-filtro ${categoria === item.id ? "ativo" : ""}`}
                  onClick={() => setCategoria(item.id)}
                >
                  <Icon nome={item.icone} />
                  {item.nome.split(" ")[0]}
                </button>
              ))}
            </div>

            <div className="cc-lista">
              {carregando && (
                <div className="cc-vazio">
                  <span className="cc-spinner" />
                </div>
              )}
              {!carregando && recentes.length === 0 && <div className="cc-vazio">Nenhuma notificação registrada ainda.</div>}
              {recentes.map((item) => (
                <div key={item.id} className="cc-item" onClick={() => navegar(`/ocorrencia/${item.id}`)}>
                  <div>
                    <div className="cc-item-titulo">{tituloOcorrencia(item)}</div>
                    <div className="cc-item-meta">
                      {item.categoria.nome}
                      <strong>Municipal</strong>
                    </div>
                  </div>
                  <Selo status={item.status} urgencia={item.nivel_urgencia} />
                </div>
              ))}
            </div>
            <Link to="/mapa" className="cc-mais">
              Ver todas as notificações <Icon nome="seta" tamanho={13} />
            </Link>
          </div>

          <div className="cc-mapa-quadro">
            <MapView pontos={pontos} onAbrir={(id) => navegar(`/ocorrencia/${id}`)} zoom={13} />
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
