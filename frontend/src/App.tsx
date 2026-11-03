import { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Home from "./pages/Home";
import NovaOcorrencia from "./pages/NovaOcorrencia";
import Detalhe from "./pages/Detalhe";
import MapaPage from "./pages/MapaPage";
import Minhas from "./pages/Minhas";
import PainelPublico from "./pages/PainelPublico";
import PainelAdmin from "./pages/PainelAdmin";
import RotaProtegida from "./components/RotaProtegida";

function Cidadao({ children }: { children: ReactElement }) {
  return <RotaProtegida tipoExigido="cidadao">{children}</RotaProtegida>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />

      <Route path="/" element={<Cidadao><Home /></Cidadao>} />
      <Route path="/mapa" element={<Cidadao><MapaPage /></Cidadao>} />
      <Route path="/minhas" element={<Cidadao><Minhas /></Cidadao>} />
      <Route path="/painel-publico" element={<Cidadao><PainelPublico /></Cidadao>} />
      <Route path="/nova" element={<Cidadao><NovaOcorrencia /></Cidadao>} />

      <Route path="/ocorrencia/:id" element={<RotaProtegida><Detalhe /></RotaProtegida>} />
      <Route path="/admin" element={<RotaProtegida tipoExigido="administrador"><PainelAdmin /></RotaProtegida>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
