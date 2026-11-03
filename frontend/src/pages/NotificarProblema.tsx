import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

export default function NotificarProblema() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nivelUrgencia, setNivelUrgencia] = useState("media");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();

  useEffect(() => {
    api
      .get("/categorias")
      .then((resposta) => setCategorias(resposta.data))
      .catch(() => setErro("Não foi possível carregar as categorias"));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (posicao) => {
          setLatitude(posicao.coords.latitude);
          setLongitude(posicao.coords.longitude);
        },
        () => {
          // Se o usuário negar a localização, os campos continuam vazios
          // e precisam ser informados manualmente abaixo.
        }
      );
    }
  }, []);

  function handleFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0] || null;
    setFoto(arquivo);
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    if (descricao.trim().length < 20) {
      setErro("Descreva o problema com pelo menos 20 caracteres");
      return;
    }

    if (latitude === null || longitude === null) {
      setErro("Informe a localização do problema");
      return;
    }

    setCarregando(true);

    const dados = new FormData();
    dados.append("categoria_id", categoriaId);
    dados.append("descricao", descricao.trim());
    dados.append("nivel_urgencia", nivelUrgencia);
    dados.append("logradouro", logradouro);
    dados.append("numero", numero);
    dados.append("bairro", bairro);
    dados.append("latitude", String(latitude));
    dados.append("longitude", String(longitude));

    if (foto) {
      dados.append("foto", foto);
    }

    try {
      const resposta = await api.post("/ocorrencias", dados, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProtocolo(resposta.data.ocorrencia.protocolo);
    } catch (erroRequisicao: any) {
      setErro(erroRequisicao?.response?.data?.erro || "Não foi possível registrar a ocorrência");
    } finally {
      setCarregando(false);
    }
  }

  if (protocolo) {
    return (
      <div className="container" style={{ maxWidth: "480px", marginTop: "60px" }}>
        <div className="alert alert-success text-center">
          <h2 className="h5">Ocorrência registrada com sucesso</h2>
          <p className="mb-1">Seu protocolo é:</p>
          <p className="fw-bold fs-5">{protocolo}</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary w-100" onClick={() => navegar("/minhas-ocorrencias")}>
            Ver minhas ocorrências
          </button>
          <button className="btn btn-primary w-100" onClick={() => window.location.reload()}>
            Registrar outra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "480px", marginTop: "40px" }}>
      <h1 className="h4 mb-4 text-center">Notificar um problema</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Categoria</label>
          <select
            className="form-select"
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Descrição</label>
          <textarea
            className="form-control"
            rows={4}
            maxLength={500}
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            required
          />
          <div className="form-text">{descricao.length}/500 caracteres (mínimo 20)</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Nível de urgência</label>
          <select
            className="form-select"
            value={nivelUrgencia}
            onChange={(evento) => setNivelUrgencia(evento.target.value)}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Endereço</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Rua, avenida..."
            value={logradouro}
            onChange={(evento) => setLogradouro(evento.target.value)}
            required
          />
          <div className="row g-2">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Número"
                value={numero}
                onChange={(evento) => setNumero(evento.target.value)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Bairro"
                value={bairro}
                onChange={(evento) => setBairro(evento.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Localização (latitude / longitude)</label>
          <div className="row g-2">
            <div className="col">
              <input
                type="number"
                step="any"
                className="form-control"
                placeholder="Latitude"
                value={latitude ?? ""}
                onChange={(evento) => setLatitude(Number(evento.target.value))}
                required
              />
            </div>
            <div className="col">
              <input
                type="number"
                step="any"
                className="form-control"
                placeholder="Longitude"
                value={longitude ?? ""}
                onChange={(evento) => setLongitude(Number(evento.target.value))}
                required
              />
            </div>
          </div>
          <div className="form-text">
            Preenchido automaticamente pela localização do navegador, quando autorizada.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Foto (opcional)</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleFoto} />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={carregando}>
          {carregando ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
