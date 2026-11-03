import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AuthDividido, CampoSenha } from "../components/AuthShell";
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
    <AuthDividido>
      <h1 style={{ marginBottom: 22 }}>Cadastre-se</h1>

      {erro && <div className="cc-erro">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <div className="cc-campo">
          <label className="cc-label">Nome:</label>
          <input
            className="cc-input"
            placeholder="Digite seu nome completo"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            required
          />
        </div>
        <div className="cc-campo">
          <label className="cc-label">E-mail:</label>
          <input
            type="email"
            className="cc-input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
        </div>
        <CampoSenha rotulo="Senha:" valor={senha} aoMudar={setSenha} minimo={6} />
        <CampoSenha rotulo="Confirme sua senha:" valor={confirmar} aoMudar={setConfirmar} minimo={6} />

        <label className="cc-termos">
          <input type="checkbox" checked={termos} onChange={(evento) => setTermos(evento.target.checked)} />
          <span>
            Concordo com os Termos e Condições <b>*</b>
          </span>
        </label>

        <button type="submit" className="cc-btn cc-btn-escuro cc-btn-bloco" disabled={carregando}>
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <BotaoGoogle aoErro={setErro} />

      <p style={{ textAlign: "center", marginTop: 22, fontSize: 16, color: "#4b5563" }}>
        Já tem conta?{" "}
        <Link to="/login" className="cc-link">
          Entrar
        </Link>
      </p>
    </AuthDividido>
  );
}
