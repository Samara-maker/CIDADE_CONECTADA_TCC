import { useEffect, useRef } from "react";
import L from "leaflet";
import { corMapa } from "../utils/format";

export interface PontoMapa {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  urgencia: string;
  titulo: string;
  subtitulo: string;
}

interface Props {
  pontos?: PontoMapa[];
  selecionado?: string | null;
  onAbrir?: (id: string) => void;
  // modo de escolha de local (formulário)
  escolha?: { latitude: number; longitude: number } | null;
  onEscolher?: (latitude: number, longitude: number) => void;
  centro?: [number, number];
  zoom?: number;
}

const CENTRO_JI_PARANA: [number, number] = [-10.8777, -61.9322];

export default function MapView({ pontos = [], selecionado, onAbrir, escolha, onEscolher, centro, zoom = 13 }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const camada = useRef<L.LayerGroup | null>(null);
  const marcadorEscolha = useRef<L.CircleMarker | null>(null);
  const aoEscolher = useRef(onEscolher);
  aoEscolher.current = onEscolher;

  // cria o mapa uma única vez
  useEffect(() => {
    if (!caixa.current) return;

    const instancia = L.map(caixa.current, { zoomControl: true }).setView(centro ?? CENTRO_JI_PARANA, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores do OpenStreetMap",
    }).addTo(instancia);

    camada.current = L.layerGroup().addTo(instancia);

    instancia.on("click", (evento: L.LeafletMouseEvent) => {
      if (aoEscolher.current) aoEscolher.current(evento.latlng.lat, evento.latlng.lng);
    });

    mapa.current = instancia;

    return () => {
      instancia.remove();
      mapa.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // desenha os pontos
  useEffect(() => {
    const grupo = camada.current;
    if (!grupo) return;

    grupo.clearLayers();

    pontos.forEach((ponto) => {
      const ativo = ponto.id === selecionado;
      const marcador = L.circleMarker([ponto.latitude, ponto.longitude], {
        radius: ativo ? 13 : 9,
        color: "#ffffff",
        weight: 2,
        fillColor: corMapa(ponto.status, ponto.urgencia),
        fillOpacity: 0.95,
      });

      const conteudo = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.textContent = ponto.titulo;
      const subtitulo = document.createElement("div");
      subtitulo.textContent = ponto.subtitulo;
      subtitulo.style.fontSize = "12px";
      subtitulo.style.color = "#5a7264";
      conteudo.appendChild(titulo);
      conteudo.appendChild(subtitulo);

      if (onAbrir) {
        const botao = document.createElement("button");
        botao.textContent = "Ver detalhes";
        botao.className = "cc-btn cc-btn-pequeno";
        botao.style.marginTop = "8px";
        botao.onclick = () => onAbrir(ponto.id);
        conteudo.appendChild(botao);
      }

      marcador.bindPopup(conteudo);
      marcador.addTo(grupo);

      if (ativo) {
        marcador.openPopup();
        mapa.current?.panTo([ponto.latitude, ponto.longitude]);
      }
    });
  }, [pontos, selecionado, onAbrir]);

  // marcador do local escolhido no formulário
  useEffect(() => {
    const instancia = mapa.current;
    if (!instancia) return;

    if (marcadorEscolha.current) {
      marcadorEscolha.current.remove();
      marcadorEscolha.current = null;
    }

    if (escolha) {
      marcadorEscolha.current = L.circleMarker([escolha.latitude, escolha.longitude], {
        radius: 11,
        color: "#ffffff",
        weight: 3,
        fillColor: "#115a38",
        fillOpacity: 1,
      }).addTo(instancia);
      instancia.panTo([escolha.latitude, escolha.longitude]);
    }
  }, [escolha]);

  return <div ref={caixa} className="cc-map-box" />;
}
