import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import MapView, { PontoMapa } from "../components/MapView";
import { OcorrenciaPublica } from "../utils/tipos";
import { corMapa, ordenarCategorias, tituloOcorrencia } from "../utils/format";

export default function MapaPage() {
  const navegar = useNavigate();
  const [lista, setLista] = useState<OcorrenciaPublica[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nome: string; icone: string }[]>([]);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(null);

  useEffect(() => {
    api.get("/publico/ocorrencias").then((r) => setLista(r.data)).catch(() => setLista([]));
    api.get("/categorias").then((r) => setCategorias(ordenarCategorias(r.data as { id: string; nome: string; icone: string }[]))).catch(() => setCategorias([]));
  }, []);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter(
      (item) =>
        (!categoria || item.categoria.id === categoria) &&
        (!termo || `${item.categoria.nome} ${item.endereco} ${item.protocolo}`.toLowerCase().includes(termo))
    );
  }, [lista, categoria, busca]);

  const pontos: PontoMapa[] = filtradas.map((item) => ({
    id: item.id,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    status: item.status,
    urgencia: item.nivel_urgencia,
    titulo: item.categoria.nome,
    subtitulo: item.endereco,
  }));

  return (
    <CitizenLayout>
      <div className="cc-mapa-tela">
        <aside className="cc-mapa-lateral bg-white">
          <div className="p-3 border-bottom">
            <input
              className="form-control mb-2"
              placeholder="Buscar endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${categoria === "" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setCategoria("")}
              >
                Todos
              </button>
              {categorias.map((item) => (
                <button
                  key={item.id}
                  className={`btn btn-sm ${categoria === item.id ? "btn-success" : "btn-outline-success"}`}
                  onClick={() => setCategoria(item.id)}
                >
                  {item.nome.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="list-group list-group-flush overflow-auto flex-grow-1">
            {filtradas.length === 0 && <p className="text-muted text-center p-4 mb-0">Nenhuma notificação encontrada.</p>}
            {filtradas.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`list-group-item list-group-item-action text-dark d-flex justify-content-between align-items-center gap-2 text-start ${
                  selecionado === item.id ? "list-group-item-success" : ""
                }`}
                onClick={() => setSelecionado(item.id)}
              >
                <div>
                  <div className="fw-semibold">{tituloOcorrencia(item)}</div>
                  <small className="text-muted">{item.categoria.nome}</small>
                </div>
                <span
                  className="rounded-circle d-inline-block flex-shrink-0"
                  style={{ width: 12, height: 12, background: corMapa(item.status, item.nivel_urgencia) }}
                />
              </button>
            ))}
          </div>
        </aside>

        <div className="cc-mapa-grande" style={{ minHeight: 0 }}>
          <MapView pontos={pontos} selecionado={selecionado} onAbrir={(id) => navegar(`/ocorrencia/${id}`)} />
        </div>
      </div>
    </CitizenLayout>
  );
}
