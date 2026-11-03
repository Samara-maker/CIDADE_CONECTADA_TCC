import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthCentral } from "../components/AuthShell";
import Icon from "../components/Icon";
import { mensagemErro } from "../utils/format";

export default function RecuperarSenha() {
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await api.post("/auth/recuperar-senha", { email });
      setEnviado(true);
    } catch (erroRequisicao) {
      setErro(mensagemErro(erroRequisicao, "Não foi possível processar a solicitação"));
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <AuthCentral>
        <div className="check">
          <Icon nome="check" />
        </div>
        <p style={{ margin: "0 0 8px" }}>
          Se o endereço informado estiver cadastrado, você receberá em instantes um e-mail com o link de redefinição de
          senha.
        </p>
        <p style={{ margin: "0 0 26px", fontWeight: 300, fontSize: 16 }}>O link enviado é válido por 30 minutos.</p>
        <button className="cc-btn" onClick={() => navegar("/login")}>
          Voltar para a tela de login
        </button>
      </AuthCentral>
    );
  }

  return (
    <AuthCentral subtitulo="Recuperação de senha">
      <p>
        Digite o e-mail cadastrado na sua conta. Se ele existir na nossa base, você receberá um link para redefinir sua
        senha.
      </p>

      {erro && <div className="cc-erro">{erro}</div>}

      <form onSubmit={handleSubmit}>
        <label>E-mail cadastrado</label>
        <input
          type="email"
          className="cc-input"
          placeholder="example@gmail.com"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
        />
        <button type="submit" className="cc-btn" disabled={carregando}>
          {carregando ? "Enviando..." : "Enviar Link de redefinição"}
        </button>
      </form>

      <Link to="/login" className="voltar">
        ← Voltar para o login
      </Link>
    </AuthCentral>
  );
}
