import { ReactNode } from "react";

interface Props {
  titulo: string;
  aoFechar: () => void;
  rodape?: ReactNode;
  children: ReactNode;
}

// Janela (modal) do Bootstrap controlada pelo React
export default function Janela({ titulo, aoFechar, rodape, children }: Props) {
  return (
    <div className="modal d-block" style={{ background: "rgba(0, 0, 0, 0.5)" }} onClick={aoFechar}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5">{titulo}</h2>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={aoFechar} />
          </div>
          <div className="modal-body">{children}</div>
          {rodape && <div className="modal-footer">{rodape}</div>}
        </div>
      </div>
    </div>
  );
}
