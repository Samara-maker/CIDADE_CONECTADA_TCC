import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AuthCartao, CampoSenha } from "../components/AuthShell";
import BotaoGoogle from "../components/BotaoGoogle";
import { mensagemErro } from "../utils/format";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [termos, setTermos] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();
  const { entrar } = useAuth();

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    if (senha !== confirmar) {
      setErro("As senhas não conferem");
      return;
    }

    if (!termos) {
      setErro("É preciso concordar com os Termos e Condições");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await api.post("/auth/cadastro", { nome, email, senha });
      entrar(resposta.data.token, resposta.data.usuario, true);
      navegar("/");
    } catch (erroRequisicao) {
      setErro(mensagemErro(erroRequisicao, "Não foi possível concluir o cadastro"));
    } finally {
      setCarregando(false);
    }
  }

   return (
    <AuthCartao titulo="Cadastre-se">
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input className="form-control" value={nome} onChange={(evento) => setNome(evento.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>
        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} minimo={6} autoComplete="new-password" />
        <CampoSenha rotulo="Confirme a senha" valor={confirmar} aoMudar={setConfirmar} minimo={6} autoComplete="new-password" />

        <div className="form-check mb-3">
          <input
            id="termos"
            type="checkbox"
            className="form-check-input"
            checked={termos}
            onChange={(evento) => setTermos(evento.target.checked)}
          />
          <label htmlFor="termos" className="form-check-label">
            Concordo com os Termos e Condições
          </label>
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <BotaoGoogle aoErro={setErro} />

      <p className="text-center mt-3 mb-0">
        Já tem conta?{" "}
        <Link to="/login" className="text-success">
          Entrar
        </Link>
      </p>
    </AuthCartao>
  );
}
