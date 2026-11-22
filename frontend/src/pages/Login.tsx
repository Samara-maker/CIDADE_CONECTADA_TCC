import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AuthCartao, CampoSenha } from "../components/AuthShell";
import BotaoGoogle from "../components/BotaoGoogle";
import { mensagemErro } from "../utils/format";

export default function Login() {
  // Se o lembre-me foi marcado em um acesso anterior, o e-mail já vem preenchido
  const emailLembrado = localStorage.getItem("cc_email_lembrado") ?? "";
  const [email, setEmail] = useState(emailLembrado);
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(emailLembrado !== "");
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

      // A senha nunca é guardada pelo sistema. Só o e-mail, e apenas se o lembre-me estiver marcado.
      if (lembrar) {
        localStorage.setItem("cc_email_lembrado", email);
      } else {
        localStorage.removeItem("cc_email_lembrado");
      }

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
    <AuthCartao titulo="Entrar">
      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            name="email"
            autoComplete="username"
            className="form-control"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>

        <CampoSenha rotulo="Senha" valor={senha} aoMudar={setSenha} />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              id="lembrar"
              type="checkbox"
              className="form-check-input"
              checked={lembrar}
              onChange={(evento) => setLembrar(evento.target.checked)}
            />
            <label htmlFor="lembrar" className="form-check-label">
              Lembre-me
            </label>
          </div>
          <Link to="/recuperar-senha" className="text-success small">
            Esqueceu a senha?
          </Link>
        </div>

        <button type="submit" className="btn btn-success w-100" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <BotaoGoogle aoErro={setErro} />

      <p className="text-center mt-3 mb-0">
        Não tem conta?{" "}
        <Link to="/cadastro" className="text-success">
          Cadastre-se
        </Link>
      </p>
    </AuthCartao>
  );
}