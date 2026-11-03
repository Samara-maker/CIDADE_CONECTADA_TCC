import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useToast } from "../../components/Toast";
import { mensagemErro } from "../../utils/format";
import { OcorrenciaAdmin } from "./tipos";

type Parametros = Record<string, boolean>;

interface Administrador {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  tem_senha: boolean;
  secretaria: string | null;
}

interface SecretariaOpcao {
  id: string;
  nome: string;
  sigla: string;
}

const NOTIFICACOES = [
  { chave: "notif_confirmacao", rotulo: "Confirmação de registro" },
  { chave: "notif_status", rotulo: "Atualização de status" },
  { chave: "notif_resolvida", rotulo: "Resolução concluída" },
  { chave: "notif_prazo", rotulo: "Alertas de Prazo vencido" },
  { chave: "notif_nao_municipal", rotulo: "Ocorrência não municipal" },
];

const ANALISE = [
  { chave: "ia_ativa", rotulo: "Análise automática ativa" },
  { chave: "ia_citar_lei", rotulo: "Citar legislação na resposta" },
  { chave: "ia_bloquear_federal", rotulo: "Bloquear se federal/estadual" },
];

export default function Configuracoes({ ocorrencias }: { ocorrencias: OcorrenciaAdmin[] }) {
  const aviso = useToast();
  const { usuario } = useAuth();
  const [formAberto, setFormAberto] = useState(false);
  const [secretarias, setSecretarias] = useState<SecretariaOpcao[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novaSecretaria, setNovaSecretaria] = useState("");
  const [cadastrando, setCadastrando] = useState(false);
  const [parametros, setParametros] = useState<Parametros>({});
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [prazos, setPrazos] = useState<{ id: string; nome: string; dias: number }[]>([]);

  useEffect(() => {
    api.get("/admin/configuracoes").then((r) => setParametros(r.data));
    carregarAdministradores();
    api.get("/admin/secretarias").then((r) => setSecretarias(r.data));
    api.get("/categorias").then((r) =>
      setPrazos(r.data.map((c: { id: string; nome: string; prazo_padrao_dias: number }) => ({ id: c.id, nome: c.nome, dias: c.prazo_padrao_dias })))
    );
  }, [ocorrencias.length]);

  function carregarAdministradores() {
    api.get("/admin/administradores").then((r) => setAdministradores(r.data));
  }

  async function cadastrarAdministrador(evento: FormEvent) {
    evento.preventDefault();
    setCadastrando(true);
    try {
      await api.post("/admin/administradores", {
        nome: novoNome,
        email: novoEmail,
        senha: novaSenha || undefined,
        secretaria_id: novaSecretaria || undefined,
      });
      aviso("Administrador cadastrado.");
      setNovoNome("");
      setNovoEmail("");
      setNovaSenha("");
      setNovaSecretaria("");
      setFormAberto(false);
      carregarAdministradores();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível cadastrar o administrador."), "erro");
    } finally {
      setCadastrando(false);
    }
  }

  async function alternarAtivo(admin: Administrador) {
    try {
      await api.patch(`/admin/administradores/${admin.id}/ativo`, { ativo: !admin.ativo });
      carregarAdministradores();
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível alterar o administrador."), "erro");
    }
  }

  async function salvarParametros() {
    try {
      await api.put("/admin/configuracoes", parametros);
      aviso("Configurações salvas.");
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível salvar."), "erro");
    }
  }

  async function salvarPrazos() {
    try {
      await api.put("/admin/prazos", { prazos: prazos.map((p) => ({ id: p.id, dias: p.dias })) });
      aviso("Prazos salvos.");
    } catch (erro) {
      aviso(mensagemErro(erro, "Não foi possível salvar os prazos."), "erro");
    }
  }

  function marcador(lista: { chave: string; rotulo: string }[]) {
    return lista.map((item) => (
      <label key={item.chave} className="cc-marcar">
        {item.rotulo}
        <input
          type="checkbox"
          checked={!!parametros[item.chave]}
          onChange={(e) => setParametros({ ...parametros, [item.chave]: e.target.checked })}
        />
      </label>
    ));
  }

  return (
    <>
      <div className="cc-admin-cab" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="cc-titulo">Configurações do Sistema</h1>
          <p className="cc-subtitulo" style={{ fontSize: 14 }}>Parâmetros gerais da plataforma</p>
        </div>
      </div>

      <div className="cc-config">
        <div>
          <div className="cc-config-card">
            <div className="cc-config-topo">
              <h4>Prazo de resposta</h4>
              <small>Tempo máximo de resposta por categoria</small>
            </div>
            <div className="cc-config-corpo">
              {prazos.map((p) => (
                <div key={p.id} className="cc-campo" style={{ marginBottom: 12 }}>
                  <label className="cc-label" style={{ fontWeight: 600 }}>{p.nome} (dias)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    className="cc-input"
                    value={p.dias}
                    onChange={(e) => setPrazos(prazos.map((x) => (x.id === p.id ? { ...x, dias: Number(e.target.value) } : x)))}
                  />
                </div>
              ))}
              <button className="cc-btn" onClick={salvarPrazos}>Salvar Prazos</button>
            </div>
          </div>

          <div className="cc-config-card">
            <div className="cc-config-topo">
              <h4>Análise de Jurisdição</h4>
              <small>Módulo de verificação de competência (município, estado ou União)</small>
            </div>
            <div className="cc-config-corpo">
              {marcador(ANALISE)}
              <button className="cc-btn" style={{ marginTop: 16 }} onClick={salvarParametros}>Salvar</button>
            </div>
          </div>
        </div>

        <div>
          <div className="cc-config-card">
            <div className="cc-config-topo">
              <h4>Notificações Automáticas</h4>
              <small>E-mail para cidadãos</small>
            </div>
            <div className="cc-config-corpo">
              {marcador(NOTIFICACOES)}
              <button className="cc-btn" style={{ marginTop: 16 }} onClick={salvarParametros}>Salvar</button>
            </div>
          </div>

          <div className="cc-config-card">
            <div className="cc-config-topo" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h4>Usuários Administrativos</h4>
                <small>Somente administradores cadastram outros administradores</small>
              </div>
              <button className="cc-btn cc-btn-pequeno" onClick={() => setFormAberto((aberto) => !aberto)}>
                {formAberto ? "Cancelar" : "Adicionar"}
              </button>
            </div>

            {formAberto && (
              <form className="cc-form-admin" onSubmit={cadastrarAdministrador}>
                <div className="cc-campo">
                  <label className="cc-label">Nome</label>
                  <input className="cc-input" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required minLength={3} />
                </div>
                <div className="cc-campo">
                  <label className="cc-label">E-mail (o mesmo da conta Google)</label>
                  <input type="email" className="cc-input" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} required />
                </div>
                <div className="cc-campo">
                  <label className="cc-label">Secretaria</label>
                  <select className="cc-select" value={novaSecretaria} onChange={(e) => setNovaSecretaria(e.target.value)}>
                    <option value="">Sem secretaria (acesso geral)</option>
                    {secretarias.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="cc-campo">
                  <label className="cc-label">Senha (opcional)</label>
                  <input type="password" className="cc-input" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} minLength={6} autoComplete="new-password" />
                  <small>Sem senha, a pessoa entra apenas com o Google.</small>
                </div>
                <button className="cc-btn" disabled={cadastrando}>
                  {cadastrando ? "Cadastrando..." : "Cadastrar administrador"}
                </button>
              </form>
            )}

            <div className="cc-tabela-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="cc-tabela">
                <thead><tr><th>Usuário</th><th>Perfil</th><th></th></tr></thead>
                <tbody>
                  {administradores.map((a) => (
                    <tr key={a.id}>
                      <td className="esq" style={{ fontSize: 13 }}>
                        <b>{a.nome}</b>
                        <br />
                        {a.email}
                      </td>
                      <td><span className={`cc-perfil ${a.ativo ? "" : "inativo"}`}>{a.ativo ? a.secretaria ?? "Admin" : "Desativado"}</span></td>
                      <td>
                        {a.email !== usuario?.email && (
                          <button className="cc-link-btn" onClick={() => alternarAtivo(a)}>
                            {a.ativo ? "Desativar" : "Ativar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
