import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Icon from "../components/Icon";
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
        (!termo ||
          `${item.categoria.nome} ${item.endereco} ${item.protocolo}`
            .toLowerCase()
            .includes(termo))
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
        <aside className="cc-mapa-lateral">
          <div className="cc-mapa-topo">
            <div className="cc-busca">
              <Icon nome="busca" />
              <input placeholder="Buscar Endereço..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="cc-filtros" style={{ marginBottom: 0 }}>
              <button className={`cc-filtro ${categoria === "" ? "ativo" : ""}`} onClick={() => setCategoria("")}>
                Todos
              </button>
              {categorias.map((item) => (
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
          </div>

          <div className="cc-mapa-lista">
            {filtradas.length === 0 && <div className="cc-vazio">Nenhuma notificação encontrada.</div>}
            {filtradas.map((item) => (
              <div
                key={item.id}
                className={`cc-mapa-item ${selecionado === item.id ? "ativo" : ""}`}
                onClick={() => setSelecionado(item.id)}
              >
                <div>
                  <div className="t">{tituloOcorrencia(item)}</div>
                  <div className="m">
                    {item.categoria.nome}
                  </div>
                </div>
                <span className="cc-bolinha" style={{ background: corMapa(item.status, item.nivel_urgencia) }} />
              </div>
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
