import { useEffect, useState } from "react";

interface EventoInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Guarda o evento que o navegador dispara quando o sistema pode ser instalado
export function useInstalarApp() {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);

  useEffect(() => {
    function aoPoderInstalar(e: Event) {
      e.preventDefault();
      setEvento(e as EventoInstalacao);
    }
    function aoInstalar() {
      setEvento(null);
    }
    window.addEventListener("beforeinstallprompt", aoPoderInstalar);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPoderInstalar);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
  }

  return { podeInstalar: evento !== null, instalar };
}
