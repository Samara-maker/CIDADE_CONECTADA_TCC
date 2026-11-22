import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { mensagemErro } from "../utils/format";

export const GOOGLE_ATIVO = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

interface Props {
  aoErro: (mensagem: string) => void;
}

function LogoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// Botão "Entrar com o Google". O mesmo botão serve para cidadão e administrador:
// o servidor identifica o perfil pelo e-mail da conta Google.
export default function BotaoGoogle({ aoErro }: Props) {
  const navegar = useNavigate();
  const { entrar } = useAuth();

  async function aoSucesso(credencial?: string) {
    if (!credencial) {
      aoErro("Não foi possível obter a conta do Google");
      return;
    }

    try {
      const resposta = await api.post("/auth/google", { credencial });
      entrar(resposta.data.token, resposta.data.usuario, true);
      navegar(resposta.data.usuario.tipo === "administrador" ? "/admin" : "/");
    } catch (erro) {
      const semResposta = !(erro as { response?: unknown }).response;
      aoErro(
        semResposta
          ? "Não foi possível conectar ao servidor. Confira se o backend está rodando."
          : mensagemErro(erro, "Não foi possível entrar com o Google")
      );
    }
  }

  return (
    <div className="mt-3">
      <div className="text-center text-muted small mb-3">ou</div>
      <div className="d-flex justify-content-center">
        {GOOGLE_ATIVO ? (
          <GoogleLogin
            onSuccess={(resposta) => aoSucesso(resposta.credential)}
            onError={() => aoErro("Não foi possível entrar com o Google")}
            text="continue_with"
            shape="pill"
            size="large"
            width="300"
          />
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => aoErro("O login com Google ainda não foi configurado. Defina VITE_GOOGLE_CLIENT_ID no .env do frontend.")}
          >
            <LogoGoogle />
            Continuar com o Google
          </button>
        )}
      </div>
    </div>
  );
}