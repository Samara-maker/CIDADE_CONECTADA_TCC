import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { iniciais } from "../utils/format";
import logo from "../img/logo.png";

export default function AdminTopbar() {
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const navegar = useNavigate();

  function handleSair() {
    sair();
    navegar("/login");
  }

  return (
    <nav className="navbar navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid">
        <Link to="/admin" className="navbar-brand">
          <img src={logo} alt="Cidade Conectada" height="36" />
        </Link>

        <span className="badge text-bg-success me-auto ms-2 d-none d-sm-inline">Painel administrativo</span>

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
            <div className="dropdown-menu dropdown-menu-end show">
              <span className="dropdown-item-text fw-semibold">{usuario?.nome}</span>
              <span className="dropdown-item-text small text-muted">{usuario?.email}</span>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleSair}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
