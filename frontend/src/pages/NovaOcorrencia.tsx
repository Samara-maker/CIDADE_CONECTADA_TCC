import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CitizenLayout from "../components/CitizenLayout";
import Icon, { Logo } from "../components/Icon";
import { Categoria } from "../utils/tipos";
import { corCategoria, formatarData, ordenarCategorias, mensagemErro, protocoloCurto } from "../utils/format";

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
      <div className="cc-sucesso-tela">
        <div className="cc-logo" style={{ padding: "24px 38px" }}>
          <Logo />
        </div>
        <div className="cc-sucesso">
          <div className="cc-sucesso-ok">
            <Icon nome="check" />
          </div>
          <h2>Notificação enviada com sucesso!</h2>
          <p>
            Seu relato foi registrado com sucesso e encaminhado à {registro.secretaria}. Você receberá atualizações por
            e-mail.
          </p>
          <div className="cc-recibo">
            <div><span>Protocolo</span><span>{protocoloCurto(registro.protocolo)}</span></div>
            <div><span>Categoria</span><span>{registro.categoria}</span></div>
            <div><span>Secretaria responsável</span><span>{registro.secretaria}</span></div>
            <div><span>Prazo de resposta</span><span>até {formatarData(registro.prazo_sla)}</span></div>
            <div>
              <span>Data do registro</span>
              <span>
                {data.toLocaleDateString("pt-BR")} · {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <div className="cc-email-enviado">
            <span>E-mail de confirmação enviado</span>
          </div>
          <div className="cc-sucesso-acoes">
            <button className="cc-btn cc-btn-claro" onClick={() => navegar(`/ocorrencia/${registro.id}`)}>
              Ver acompanhamento
            </button>
            <button className="cc-btn cc-btn-escuro" onClick={() => navegar("/")}>
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CitizenLayout mostrarNotificar={false}>
      <div className="cc-form-pagina">
        <Link to="/" className="cc-voltar">
          <Icon nome="voltar" />
          Voltar ao início
        </Link>

        <div className="cc-etapas">
          {PASSOS.map((nome, indice) => {
            const posicao = indice + 1;
            const estado = posicao <= etapa ? "" : posicao === etapa + 1 ? "pendente" : "futura";
            return (
              <div key={nome} className={`cc-etapa ${estado}`}>
                <span className="cc-etapa-num">{posicao}</span>
                {nome}
              </div>
            );
          })}
        </div>

        <form className="cc-form-card" onSubmit={handleSubmit}>
          <div className="cc-form-topo">
            <h2>
              <Icon nome="mapa" />
              Notificar problema urbano
            </h2>
            <p>Preencha os dados abaixo para registrar a sua ocorrência</p>
          </div>

          <div className="cc-form-corpo">
            {erro && <div className="cc-erro">{erro}</div>}

            <div className="cc-campo">
              <label className="cc-label">
                Categoria do problema <b>*</b>
              </label>
              <div className="cc-cats">
                {categorias.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`cc-cat ${categoriaId === item.id ? "ativa" : ""}`}
                    onClick={() => setCategoriaId(item.id)}
                  >
                    <span style={{ color: corCategoria(item.icone) }}>
                      <Icon nome={item.icone} />
                    </span>
                    {item.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="cc-campo">
              <label className="cc-label">
                Endereço <b>*</b>
              </label>
              <input
                className="cc-input"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número e bairro. Ex.: Av. Marechal Rondon, 340, Jardim América"
                required
              />
            </div>

            <div className="cc-grid-2">
              <div className="cc-campo">
                <label className="cc-label">
                  Nível de urgência <b>*</b>
                </label>
                <select className="cc-select" value={urgencia} onChange={(e) => setUrgencia(e.target.value)} required>
                  <option value="">Nível de Urgência</option>
                  <option value="alta">Urgente: risco imediato</option>
                  <option value="media">Moderado: causa transtornos</option>
                  <option value="baixa">Baixo: melhoria necessária</option>
                </select>
              </div>
            </div>

            <div className="cc-campo">
              <label className="cc-label">
                Descrição do problema <b>*</b>
              </label>
              <textarea
                className="cc-textarea"
                maxLength={500}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Buraco de aproximadamente 40cm de diâmetro no meio da faixa da direita. Causando desvios perigosos no trânsito e risco de acidente para motociclistas."
              />
            </div>

            <div className="cc-campo">
              <label className="cc-label">Fotos ou vídeos</label>
              <label className="cc-envio">
                <input type="file" accept="image/jpeg,image/png,video/mp4" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
                <Icon nome="camera" />
                <div style={{ marginTop: 6 }}>
                  {foto ? foto.name : "Arraste arquivos aqui ou clique para selecionar"}
                  <br />
                  JPG, PNG, MP4 – máx. 20MB por arquivo
                </div>
              </label>
            </div>

            <div className="cc-acoes">
              <button type="button" className="cc-btn cc-btn-claro" onClick={() => navegar("/")}>
                Cancelar
              </button>
              <button type="submit" className="cc-btn" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar Notificação"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {analise && analise.bloqueia && (
        <div className="cc-fundo" onClick={() => setAnalise(null)}>
          <div className="cc-janela" style={{ width: 545 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-aviso-federal">
              <h3>
                <Icon nome="cruz" />
                {analise.titulo}
              </h3>
              <p>{analise.texto}</p>
              {analise.base_legal && (
                <p>
                  <b>Base Legal e Justificativa:</b>
                  <br />
                  {analise.base_legal}
                </p>
              )}
              <p>
                Como resolver:
                <br />
                Registre no site do DNIT ou ligue para a Superintendência Regional. O município será notificado.
              </p>
              {analise.contato && <p>Contato do órgão: {analise.contato}</p>}
            </div>
            <div className="cc-janela-acoes">
              <button className="cc-btn cc-btn-verde" style={{ minWidth: 150 }} onClick={() => setAnalise(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {analise && !analise.bloqueia && (
        <div className="cc-fundo" onClick={() => setAnalise(null)}>
          <div className="cc-janela" style={{ width: 545 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-janela-miolo cc-janela-centro">
              <h3>{analise.titulo}</h3>
              <p>{analise.texto}</p>
              {analise.base_legal && <p>{analise.base_legal}</p>}
            </div>
            <div className="cc-janela-acoes">
              <button className="cc-btn cc-btn-claro" onClick={() => setAnalise(null)}>
                Revisar dados
              </button>
              <button className="cc-btn cc-btn-verde" onClick={enviar} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}
