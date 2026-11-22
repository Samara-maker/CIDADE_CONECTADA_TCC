import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Janela from "../components/Janela";
import Selo from "../components/Selo";
import logo from "../assets/imagens/logo.png";
import { Categoria } from "../utils/tipos";
import { formatarData, ordenarCategorias, mensagemErro, protocoloCurto, tituloOcorrencia } from "../utils/format";

interface Jurisdicao {
  competencia: "municipal" | "federal";
  bloqueia: boolean;
  titulo: string;
  texto: string;
  base_legal: string;
  orgao?: string;
  contato?: string;
}

interface Registro {
  id: string;
  protocolo: string;
  prazo_sla: string;
  secretaria: string;
  categoria: string;
  criado_em: string;
}

interface Similar {
  id: string;
  protocolo: string;
  endereco: string;
  descricao: string;
  status: string;
  nivel_urgencia: string;
  criado_em: string;
  categoria: { nome: string };
  confirmacoes_total: number;
}

const PASSOS = ["Categoria", "Localização", "Detalhes", "Revisão"];

export default function NovaOcorrencia() {
  const navegar = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [endereco, setEndereco] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [analise, setAnalise] = useState<Jurisdicao | null>(null);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [similares, setSimilares] = useState<Similar[]>([]);

  useEffect(() => {
    api
      .get("/categorias")
      .then((resposta) => setCategorias(ordenarCategorias<Categoria>(resposta.data)))
      .catch(() => setErro("Não foi possível carregar as categorias."));
  }, []);

  const etapa = !categoriaId ? 1 : !endereco.trim() ? 2 : descricao.trim().length < 20 || !urgencia ? 3 : 4;

  // Primeira etapa do envio: valida os campos e pede a análise de jurisdição
  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    if (!categoriaId) return setErro("Escolha a categoria do problema.");
    if (!urgencia) return setErro("Escolha o nível de urgência.");
    if (descricao.trim().length < 20) return setErro("A descrição deve ter pelo menos 20 caracteres.");

    setEnviando(true);
    try {
      // Primeiro confere se já existe uma ocorrência aberta igual naquela rua
      const existentes = await api.post("/ocorrencias/similares", { categoria_id: categoriaId, endereco });

      if (existentes.data.length > 0) {
        setSimilares(existentes.data);
        return;
      }

      await verificarJurisdicao();
    } catch (erroRequisicao) {
      setErro(mensagemErro(erroRequisicao, "Não foi possível analisar o endereço."));
    } finally {
      setEnviando(false);
    }
  }

  // Segunda parte da validação: análise de jurisdição do endereço
  async function verificarJurisdicao() {
    setEnviando(true);
    try {
      const resposta = await api.post("/ocorrencias/jurisdicao", { categoria_id: categoriaId, endereco });
      const resultado: Jurisdicao = resposta.data;

      if (!resultado.bloqueia && !resultado.titulo) {
        await enviar();
      } else {
        setAnalise(resultado);
      }
    } catch (erroRequisicao) {
      setErro(mensagemErro(erroRequisicao, "Não foi possível analisar o endereço."));
    } finally {
      setEnviando(false);
    }
  }

  // O cidadão viu as ocorrências parecidas e quer relatar mesmo assim
  async function relatarMesmoAssim() {
    setSimilares([]);
    await verificarJurisdicao();
  }

  // Segunda etapa: grava a notificação
  async function enviar() {
    const dados = new FormData();
    dados.append("categoria_id", categoriaId);
    dados.append("descricao", descricao.trim());
    dados.append("nivel_urgencia", urgencia);
    dados.append("endereco", endereco.trim());
    if (foto) dados.append("foto", foto);

    setEnviando(true);
    try {
      const resposta = await api.post("/ocorrencias", dados);
      setAnalise(null);
      setRegistro(resposta.data.ocorrencia);
    } catch (erroRequisicao) {
      const jurisdicao = (erroRequisicao as { response?: { data?: { jurisdicao?: Jurisdicao } } }).response?.data?.jurisdicao;
      if (jurisdicao) {
        setAnalise(jurisdicao);
      } else {
        setAnalise(null);
        setErro(mensagemErro(erroRequisicao, "Não foi possível registrar a notificação."));
      }
    } finally {
      setEnviando(false);
    }
  }

  if (registro) {
    const data = new Date(registro.criado_em);
    return (
      <div className="container py-4" style={{ maxWidth: 560 }}>
        <img src={logo} alt="Cidade Conectada" height="40" className="mb-4" />
        <div className="card shadow-sm">
          <div className="card-body p-4 text-center">
            <h1 className="h4 text-success">Notificação enviada com sucesso!</h1>
            <p className="text-muted">
              Seu relato foi registrado e encaminhado à {registro.secretaria}. Você receberá atualizações por e-mail.
            </p>

            <ul className="list-group text-start mb-4">
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Protocolo</span>
                <strong>{protocoloCurto(registro.protocolo)}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Categoria</span>
                <strong>{registro.categoria}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Secretaria responsável</span>
                <strong>{registro.secretaria}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Prazo de resposta</span>
                <strong>até {formatarData(registro.prazo_sla)}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span className="text-muted">Data do registro</span>
                <strong>
                  {data.toLocaleDateString("pt-BR")} · {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </strong>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-success flex-fill" onClick={() => navegar(`/ocorrencia/${registro.id}`)}>
                Ver acompanhamento
              </button>
              <button className="btn btn-success flex-fill" onClick={() => navegar("/")}>
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CitizenLayout mostrarNotificar={false}>
      <div className="container py-4" style={{ maxWidth: 760 }}>
        <Link to="/" className="text-success d-inline-block mb-3">
          Voltar ao início
        </Link>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {PASSOS.map((nome, indice) => (
            <span key={nome} className={`badge ${indice + 1 <= etapa ? "bg-success" : "bg-secondary"}`}>
              {indice + 1}. {nome}
            </span>
          ))}
        </div>

        <form className="card shadow-sm" onSubmit={handleSubmit}>
          <div className="card-header bg-white">
            <h1 className="h4 mb-0">Notificar problema urbano</h1>
            <small className="text-muted">Preencha os dados abaixo para registrar a sua ocorrência</small>
          </div>

          <div className="card-body">
            {erro && <div className="alert alert-danger">{erro}</div>}

            <div className="mb-3">
              <label className="form-label">Categoria do problema *</label>
              <div className="row g-2">
                {categorias.map((item) => (
                  <div key={item.id} className="col-6 col-md-4">
                    <button
                      type="button"
                      className={`btn w-100 ${categoriaId === item.id ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => setCategoriaId(item.id)}
                    >
                      {item.nome}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Endereço *</label>
              <input
                className="form-control"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número e bairro. Ex.: Av. Marechal Rondon, 340, Jardim América"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nível de urgência *</label>
              <select className="form-select" value={urgencia} onChange={(e) => setUrgencia(e.target.value)} required>
                <option value="">Escolha o nível</option>
                <option value="alta">Urgente: risco imediato</option>
                <option value="media">Moderado: causa transtornos</option>
                <option value="baixa">Baixo: melhoria necessária</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Descrição do problema *</label>
              <textarea
                className="form-control"
                rows={4}
                maxLength={500}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Buraco de aproximadamente 40cm de diâmetro no meio da faixa da direita, causando risco para motociclistas."
              />
              <div className="form-text text-end">{descricao.length}/500 (mínimo de 20 caracteres)</div>
            </div>

            <div className="mb-4">
              <label className="form-label">Foto (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,video/mp4"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
              <div className="form-text">JPG, PNG ou MP4, no máximo 20MB.</div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navegar("/")}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar notificação"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {similares.length > 0 && (
        <Janela
          titulo="Já existe uma ocorrência neste endereço"
          aoFechar={() => setSimilares([])}
          rodape={
            <>
              <button className="btn btn-outline-secondary" onClick={() => setSimilares([])}>
                Voltar
              </button>
              <button className="btn btn-success" onClick={relatarMesmoAssim} disabled={enviando}>
                {enviando ? "Enviando..." : "Relatar mesmo assim"}
              </button>
            </>
          }
        >
          <p>
            Encontramos {similares.length === 1 ? "uma ocorrência aberta" : `${similares.length} ocorrências abertas`} da mesma
            categoria nesta rua. Se for o mesmo problema, você pode acompanhar e confirmar a que já existe, o que ajuda a
            prefeitura a priorizar o atendimento.
          </p>

          {similares.map((item) => (
            <div key={item.id} className="border rounded p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <strong>{tituloOcorrencia(item)}</strong>
                <Selo status={item.status} urgencia={item.nivel_urgencia} />
              </div>
              <p className="small my-2">{item.descricao}</p>
              <div className="d-flex justify-content-between flex-wrap gap-2 small text-muted">
                <span>
                  Protocolo {protocoloCurto(item.protocolo)} · {formatarData(item.criado_em)} · {item.confirmacoes_total}{" "}
                  {item.confirmacoes_total === 1 ? "confirmação" : "confirmações"}
                </span>
                <button type="button" className="btn btn-link btn-sm p-0 text-success" onClick={() => navegar(`/ocorrencia/${item.id}`)}>
                  Ver ocorrência
                </button>
              </div>
            </div>
          ))}
        </Janela>
      )}

      {analise && analise.bloqueia && (
        <Janela
          titulo={analise.titulo}
          aoFechar={() => setAnalise(null)}
          rodape={
            <button className="btn btn-success" onClick={() => setAnalise(null)}>
              OK
            </button>
          }
        >
          <p>{analise.texto}</p>
          {analise.base_legal && (
            <p>
              <strong>Base legal e justificativa:</strong>
              <br />
              {analise.base_legal}
            </p>
          )}
          <p>
            <strong>Como resolver:</strong>
            <br />
            Registre no site do DNIT ou ligue para a Superintendência Regional. O município será notificado.
          </p>
          {analise.contato && <p className="mb-0">Contato do órgão: {analise.contato}</p>}
        </Janela>
      )}

      {analise && !analise.bloqueia && (
        <Janela
          titulo={analise.titulo}
          aoFechar={() => setAnalise(null)}
          rodape={
            <>
              <button className="btn btn-outline-secondary" onClick={() => setAnalise(null)}>
                Revisar dados
              </button>
              <button className="btn btn-success" onClick={enviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </>
          }
        >
          <p>{analise.texto}</p>
          {analise.base_legal && <p className="mb-0">{analise.base_legal}</p>}
        </Janela>
      )}
    </CitizenLayout>
  );
}
