import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Icon, { Logo } from "./Icon";
import { useAuth } from "../context/AuthContext";
import { iniciais } from "../utils/format";
import { useInstalarApp } from "../hooks/useInstalarApp";

const LINKS = [
  { para: "/", rotulo: "Início", icone: "home", fim: true },
  { para: "/mapa", rotulo: "Mapa", icone: "mapa", fim: false },
  { para: "/minhas", rotulo: "Minhas notificações", icone: "sino", fim: false },
  { para: "/painel-publico", rotulo: "Painel Público", icone: "pulso", fim: false },
];

interface Props {
  mostrarNotificar?: boolean;
}

export default function Topbar({ mostrarNotificar = true }: Props) {
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const navegar = useNavigate();
  const { podeInstalar, instalar } = useInstalarApp();

  function handleSair() {
    sair();
    navegar("/login");
  }

  return (
    <header className="cc-top">
      <Link to="/">
        <Logo />
      </Link>

      <nav className="cc-nav">
        {LINKS.map((item) => (
          <NavLink key={item.para} to={item.para} end={item.fim} className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon nome={item.icone} />
            <span>{item.rotulo}</span>
          </NavLink>
        ))}
      </nav>

      <div className="cc-top-dir">
        {mostrarNotificar && (
          <Link to="/nova" className="cc-btn">
            <Icon nome="mais" />
            <span>Notificar Problema</span>
          </Link>
        )}
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
            {podeInstalar && <button onClick={instalar}>Instalar aplicativo</button>}
            <button onClick={handleSair}>Sair</button>
          </div>
        )}
      </div>
    </header>
  );
}
