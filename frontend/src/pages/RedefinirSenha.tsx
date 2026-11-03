import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { AuthCentral, CampoSenha } from "../components/AuthShell";
import Icon from "../components/Icon";
import { mensagemErro } from "../utils/format";

// Tela aberta pelo link enviado por e-mail: /redefinir-senha?token=...
export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const token = params.get("token") ?? "";
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    if (senha !== confirmar) {
      setErro("As senhas não conferem");
      return;
    }

    try {
      await api.post("/auth/redefinir-senha", { token, senhaNova: senha });
      setPronto(true);
    } catch (erroRequisicao) {
      setErro(mensagemErro(erroRequisicao, "Não foi possível redefinir a senha"));
    }
  }

  if (pronto) {
    return (
      <AuthCentral>
        <div className="check">
          <Icon nome="check" />
        </div>
        <p>Senha redefinida com sucesso. Já é possível entrar.</p>
        <button className="cc-btn" onClick={() => navegar("/login")}>
          Ir para o login
        </button>
      </AuthCentral>
    );
  }

  return (
    <AuthCentral subtitulo="Nova senha">
      <p>Escolha uma nova senha com pelo menos 6 caracteres.</p>
      {erro && <div className="cc-erro">{erro}</div>}
      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        <CampoSenha rotulo="Nova senha" valor={senha} aoMudar={setSenha} minimo={6} />
        <CampoSenha rotulo="Confirme a nova senha" valor={confirmar} aoMudar={setConfirmar} minimo={6} />
        <button type="submit" className="cc-btn">
          Salvar nova senha
        </button>
      </form>
      <Link to="/login" className="voltar">
        ← Voltar para o login
      </Link>
    </AuthCentral>
  );
}
