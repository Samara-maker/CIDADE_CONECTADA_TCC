import { createContext, useCallback, useContext, useState, ReactNode } from "react";

interface Aviso {
  id: number;
  texto: string;
  tipo: "ok" | "erro";
}

const ToastContext = createContext<(texto: string, tipo?: "ok" | "erro") => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const mostrar = useCallback((texto: string, tipo: "ok" | "erro" = "ok") => {
    const id = Date.now() + Math.random();
    setAvisos((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => setAvisos((lista) => lista.filter((aviso) => aviso.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="cc-toasts">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`cc-toast ${aviso.tipo === "erro" ? "cc-toast-erro" : ""}`}>
            {aviso.texto}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
