import { ReactNode, useState } from "react";
import { LogoPin } from "./Icon";
import logo from "../assets/imagens/logo.png";
import ilustracao from "../assets/imagens/login-ilustracao.png";

// Tela dividida do login e do cadastro: formulário de um lado, imagem do outro
export function AuthCartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="row g-0 min-vh-100">
      <div className="col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: 400 }}>
          <img src={logo} alt="Cidade Conectada" height="40" className="mb-4" />
          <h1 className="h2 text-success fw-bold mb-4">{titulo}</h1>
          {children}
        </div>
      </div>
      <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center" style={{ background: "#1d4733" }}>
        <img src={ilustracao} alt="Plataforma de notificação urbana" className="img-fluid" style={{ maxWidth: 530 }} />
      </div>
    </div>
  );
}

// Cartão central usado na recuperação de senha.
export function AuthCentral({ children, subtitulo }: { children: ReactNode; subtitulo?: string }) {
  return (
    <div className="cc-auth-centro">
      <div className="cc-cartao-auth">
        <div className="cc-logo-icon">
          <LogoPin />
        </div>
        <h2>
          Cidade<em>Conecta</em>
        </h2>
        {subtitulo && <div className="sub">{subtitulo}</div>}
        {children}
      </div>
    </div>
  );
}

export function CampoSenha({
  rotulo,
  valor,
  aoMudar,
  minimo,
  autoComplete = "current-password",
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  minimo?: number;
  autoComplete?: string;
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="mb-3">
      <label className="form-label">{rotulo}</label>
      <div className="input-group">
        <input
          className="form-control"
          type={visivel ? "text" : "password"}
          value={valor}
          minLength={minimo}
          autoComplete={autoComplete}
          onChange={(evento) => aoMudar(evento.target.value)}
          required
        />
        <button type="button" className="btn btn-outline-secondary" onClick={() => setVisivel((atual) => !atual)}>
          {visivel ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}