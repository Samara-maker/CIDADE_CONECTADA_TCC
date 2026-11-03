import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AuthDividido, CampoSenha } from "../components/AuthShell";
import BotaoGoogle from "../components/BotaoGoogle";
import { mensagemErro } from "../utils/format";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navegar = useNavigate();
  const { entrar } = useAuth();

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/login", { email, senha });
      entrar(resposta.data.token, resposta.data.usuario, lembrar);
      navegar(resposta.data.usuario.tipo === "administrador" ? "/admin" : "/");
    } catch (erroRequisicao) {
      const semResposta = !(erroRequisicao as { response?: unknown }).response;
      setErro(
        semResposta
          ? "Não foi possível conectar ao servidor. Confira se o backend está rodando."
          : mensagemErro(erroRequisicao, "Não foi possível fazer login")
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthDividido>
      <h1>Entrar</h1>
      <div className="cc-auth-sub">
        Não tem conta?{" "}
        <Link to="/cadastro" className="cc-link">
          Crie uma agora
        </Link>
      </div>

      {erro && <div className="cc-erro">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="cc-campo">
          <label className="cc-label">E-mail</label>
          <input
            type="email"
            className="cc-input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>

        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} />

        <div className="cc-lembrar">
          <label>
            <input type="checkbox" checked={lembrar} onChange={(evento) => setLembrar(evento.target.checked)} />
            lembre-me
          </label>
          <Link to="/recuperar-senha" className="cc-link">
            Esqueceu a senha?
          </Link>
        </div>

        <button type="submit" className="cc-btn cc-btn-escuro cc-btn-bloco" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <BotaoGoogle aoErro={setErro} />
    </AuthDividido>
  );
}
