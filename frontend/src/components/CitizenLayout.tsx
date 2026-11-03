import { ReactNode } from "react";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
  mostrarNotificar?: boolean;
}

export default function CitizenLayout({ children, mostrarNotificar = true }: Props) {
  return (
    <div className="cc-pagina">
      <Topbar mostrarNotificar={mostrarNotificar} />
      {children}
    </div>
  );
}
