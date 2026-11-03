import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon, { Logo } from "./Icon";
import { useAuth } from "../context/AuthContext";
import { iniciais } from "../utils/format";

export default function AdminTopbar() {
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const navegar = useNavigate();

  return (
    <header className="cc-top">
      <Link to="/admin">
        <Logo />
      </Link>
      <div className="cc-admin-badge">
        <Icon nome="chave" />
        PAINEL ADMINISTRATIVO
      </div>
      <div className="cc-top-dir">
        <button className="cc-avatar" onClick={() => setMenuAberto((aberto) => !aberto)} title="Minha conta">
          {iniciais(usuario?.nome ?? "")}
        </button>
        {menuAberto && (
          <div className="cc-menu">
            <div className="cc-menu-info">
              <strong>{usuario?.nome}</strong>
              <br />
              {usuario?.email}
            </div>
            <button
              onClick={() => {
                sair();
                navegar("/login");
              }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
