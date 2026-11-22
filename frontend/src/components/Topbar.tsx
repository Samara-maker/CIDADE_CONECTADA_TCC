import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useInstalarApp } from "../hooks/useInstalarApp";
import logo from "../img/logo.png";
import { iniciais } from "../utils/format";

const LINKS = [
  { para: "/", rotulo: "Início", fim: true },
  { para: "/mapa", rotulo: "Mapa", fim: false },
  { para: "/minhas", rotulo: "Minhas notificações", fim: false },
  { para: "/painel-publico", rotulo: "Painel Público", fim: false },
];

interface Props {
  mostrarNotificar?: boolean;
}

export default function Topbar({ mostrarNotificar = true }: Props) {
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const [navAberta, setNavAberta] = useState(false);
  const navegar = useNavigate();
  const { podeInstalar, instalar } = useInstalarApp();

  function handleSair() {
    sair();
    navegar("/login");
  }

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Cidade Conectada" height="36" />
        </Link>

        <button className="navbar-toggler" type="button" onClick={() => setNavAberta((aberta) => !aberta)}>
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`navbar-collapse collapse ${navAberta ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto">
            {LINKS.map((item) => (
              <li key={item.para} className="nav-item">
                <NavLink to={item.para} end={item.fim} className={({ isActive }) => `nav-link ${isActive ? "text-success fw-semibold" : ""}`}>
                  {item.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {mostrarNotificar && (
              <Link to="/nova" className="btn btn-success btn-sm">
                Notificar problema
              </Link>
            )}
            <div className="position-relative">
              <button
                className="btn btn-success rounded-circle fw-bold p-0"
                style={{ width: 40, height: 40 }}
                title="Minha conta"
                onClick={() => setMenuAberto((aberto) => !aberto)}
              >
                {iniciais(usuario?.nome ?? "")}
              </button>
              {menuAberto && (
                <div className="dropdown-menu dropdown-menu-end show" data-bs-popper="end">
                  <span className="dropdown-item-text small text-muted">{usuario?.email}</span>
                  <div className="dropdown-divider" />
                  {podeInstalar && (
                    <button className="dropdown-item" onClick={instalar}>
                      Instalar aplicativo
                    </button>
                  )}
                  <button className="dropdown-item" onClick={handleSair}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}