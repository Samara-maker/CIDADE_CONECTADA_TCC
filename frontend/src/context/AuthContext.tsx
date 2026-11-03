import { createContext, useContext, useState, ReactNode } from "react";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: "cidadao" | "administrador";
  secretaria?: string | null;
}

interface AuthContextData {
  usuario: Usuario | null;
  autenticado: boolean;
  entrar: (token: string, usuario: Usuario, lembrar?: boolean) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

// "Lembre-me" marcado guarda o login no navegador. Desmarcado, vale só até fechar a aba.
function lerUsuario(): Usuario | null {
  const dados = localStorage.getItem("cc_usuario") ?? sessionStorage.getItem("cc_usuario");
  return dados ? JSON.parse(dados) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuario);

  function sair() {
    for (const armazenamento of [localStorage, sessionStorage]) {
      armazenamento.removeItem("cc_token");
      armazenamento.removeItem("cc_usuario");
    }
    setUsuario(null);
  }

  function entrar(token: string, usuarioLogado: Usuario, lembrar = true) {
    sair();
    const armazenamento = lembrar ? localStorage : sessionStorage;
    armazenamento.setItem("cc_token", token);
    armazenamento.setItem("cc_usuario", JSON.stringify(usuarioLogado));
    setUsuario(usuarioLogado);
  }

  return (
    <AuthContext.Provider value={{ usuario, autenticado: !!usuario, entrar, sair }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return contexto;
}
