import { ReactNode, useState } from "react";
import Icon, { Logo, LogoPin } from "./Icon";

// Tela dividida usada no login e no cadastro: formulário à esquerda, apresentação à direita.
export function AuthDividido({ children }: { children: ReactNode }) {
  return (
    <div className="cc-auth">
      <div className="cc-auth-esq">
        <Logo pequeno />
        <div className="cc-auth-form">{children}</div>
      </div>
      <div className="cc-auth-dir">
        <div className="cc-vitrine">
          <div className="cc-vitrine-fundo" />
          <div className="cc-vitrine-a">
            <div className="cc-vitrine-ico">
              <Icon nome="sino" />
            </div>
            <div>
              <h2>Plataforma de notificação urbana</h2>
              <p>Receba alertas e informações importantes da sua cidade.</p>
            </div>
          </div>
          <div className="cc-vitrine-b">
            <div className="cc-vitrine-ico">
              <Icon nome="computador" />
            </div>
            <div>
              <h2>Acesse a plataforma e acompanhe notificações urbanas em tempo real.</h2>
            </div>
          </div>
        </div>
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
}: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  minimo?: number;
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="cc-campo">
      <label className="cc-label">{rotulo}</label>
      <div className="cc-senha">
        <input
          className="cc-input"
          type={visivel ? "text" : "password"}
          value={valor}
          minLength={minimo}
          placeholder="********"
          onChange={(evento) => aoMudar(evento.target.value)}
          required
        />
        <button type="button" className="cc-olho" onClick={() => setVisivel((atual) => !atual)} aria-label="Mostrar senha">
          <Icon nome={visivel ? "olhoFechado" : "olho"} />
        </button>
      </div>
    </div>
  );
}
