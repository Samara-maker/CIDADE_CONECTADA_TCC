import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  children: ReactNode;
  tipoExigido?: "cidadao" | "administrador";
}

export default function RotaProtegida({ children, tipoExigido }: Props) {
  const { usuario, autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (tipoExigido && usuario?.tipo !== tipoExigido) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
