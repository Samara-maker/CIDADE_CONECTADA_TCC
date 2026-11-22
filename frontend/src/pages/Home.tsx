import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Selo from "../components/Selo";
import MapView, { PontoMapa } from "../components/MapView";
import { OcorrenciaPublica, Resumo } from "../utils/tipos";
import { formatarDias, tituloOcorrencia } from "../utils/format";

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

  const numeros = [
    { rotulo: "Notificações abertas", valor: resumo?.abertas ?? "-", cor: "success" },
    { rotulo: "Em andamento", valor: resumo?.em_resolucao ?? "-", cor: "warning" },
    { rotulo: `Resolvidos (${new Date().getFullYear()})`, valor: resumo?.resolvidas ?? "-", cor: "success" },
    { rotulo: "Tempo médio de resposta", valor: resumo ? formatarDias(resumo.tempo_medio_dias) : "-", cor: "primary" },
  ];

  return (
    <CitizenLayout>
      <div className="container py-4">
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="row g-3 mb-4">
          {numeros.map((item) => (
            <div key={item.rotulo} className="col-6 col-md-3">
              <div className={`card h-100 border-0 border-start border-4 border-${item.cor} shadow-sm`}>
                <div className="card-body">
                  <div className="h3 mb-0">{item.valor}</div>
                  <small className="text-muted">{item.rotulo}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <h2 className="h4 mb-3">Notificações recentes</h2>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className={`btn btn-sm ${categoria === "" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setCategoria("")}
              >
                Todos
              </button>
              {resumo?.por_categoria.map((item) => (
                <button
                  key={item.id}
                  className={`btn btn-sm ${categoria === item.id ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setCategoria(item.id)}
                >
                  {item.nome.split(" ")[0]}
                </button>
              ))}
            </div>

            {carregando && <div className="spinner-border text-success" />}
            {!carregando && recentes.length === 0 && <p className="text-muted">Nenhuma notificação registrada ainda.</p>}

            <div className="list-group">
              {recentes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="list-group-item list-group-item-action text-dark d-flex justify-content-between align-items-start gap-2 text-start"
                  onClick={() => navegar(`/ocorrencia/${item.id}`)}
                >
                  <div>
                    <div className="fw-semibold">{tituloOcorrencia(item)}</div>
                    <small className="text-muted">{item.categoria.nome} · Municipal</small>
                  </div>
                  <Selo status={item.status} urgencia={item.nivel_urgencia} />
                </button>
              ))}
            </div>

            <Link to="/mapa" className="d-inline-block mt-3 text-success">
              Ver todas as notificações
            </Link>
          </div>

          <div className="col-lg-6">
            <div className="border rounded overflow-hidden" style={{ height: 420 }}>
              <MapView pontos={pontos} onAbrir={(id) => navegar(`/ocorrencia/${id}`)} zoom={13} />
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}