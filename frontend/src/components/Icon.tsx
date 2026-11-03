import { ReactNode } from "react";

// Ícones simples em SVG, desenhados com traço, para não depender de biblioteca externa.
const ICONES: Record<string, ReactNode> = {
  home: <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" />,
  mapa: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  sino: <path d="M6 9a6 6 0 1112 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2 2 0 004 0" />,
  pulso: <path d="M2 13h4l2.5-8 4 15 3-9 1.5 2H22" />,
  mais: <path d="M12 5v14M5 12h14" />,
  voltar: <path d="M19 12H5M12 5l-7 7 7 7" />,
  seta: <path d="M5 12h14M12 5l7 7-7 7" />,
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5z" fill="currentColor" />
    </>
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18.5 14.8c2 .7 3 2.4 3 5.2" />
    </>
  ),
  grade: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  caixa: (
    <>
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v12a1 1 0 001 1h12a1 1 0 001-1V8M10 13h4" />
    </>
  ),
  engrenagem: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </>
  ),
  sair: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  olho: (
    <>
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  olhoFechado: <path d="M17.9 17.9A10.9 10.9 0 0112 20C5.5 20 1.5 12 1.5 12a18.5 18.5 0 015.1-5.9M9.9 4.2A10 10 0 0112 4c6.5 0 10.5 8 10.5 8a18.6 18.6 0 01-2.2 3.2M1 1l22 22" />,
  filtro: <path d="M3 4h18l-7 9v6l-4 2v-8z" />,
  check: <path d="M20 6L9 17l-5-5" />,
  cruz: <path d="M18 6L6 18M6 6l12 12" />,
  camera: (
    <>
      <path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  alerta: <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01" />,
  sirene: <path d="M7 18v-6a5 5 0 0110 0v6M5 21h14M12 3v2M4.5 6.5L6 8M19.5 6.5L18 8" />,
  baixar: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  curtir: <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.3a2 2 0 002-1.7l1.4-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />,
  circulo: <circle cx="12" cy="12" r="6" />,
  engrenagemPequena: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />,
  computador: (
    <>
      <rect x="2" y="3" width="14" height="14" rx="2" />
      <rect x="18" y="3" width="4" height="14" rx="1" />
      <path d="M6 21h6M9 17v4" />
    </>
  ),
  escudo: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  chave: <path d="M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />,
  // satisfação
  triste: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" />
    </>
  ),
  neutro: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 15h8M9 9h.01M15 9h.01" />
    </>
  ),
  feliz: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
  muitoFeliz: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 13.5c1 3 8 3 9 0zM9 9h.01M15 9h.01" />
    </>
  ),
  // categorias
  via: <path d="M5 21L8 3M19 21L16 3M12 5v2.5M12 11v2.5M12 17v2.5" />,
  luz: <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.7A7 7 0 0012 2z" />,
  lixo: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />,
  agua: <path d="M12 2.7l5.7 5.6a8 8 0 11-11.4 0z" />,
  obra: (
    <>
      <path d="M3 18h13V9H8L5 13H3zM16 12h3l2 3v3h-5" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </>
  ),
  arvore: <path d="M12 22v-5M7 17h10l-3-5h2l-4-7-4 7h2z" />,
};

interface Props {
  nome: string;
  tamanho?: number;
}

export default function Icon({ nome, tamanho }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
    >
      {ICONES[nome] ?? ICONES.circulo}
    </svg>
  );
}

export function LogoPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
      <circle cx="12" cy="9" r="2.6" fill="#1a6b47" />
    </svg>
  );
}

export function Logo({ pequeno = false }: { pequeno?: boolean }) {
  return (
    <span className="cc-logo" style={pequeno ? { fontSize: 15 } : undefined}>
      <span className="cc-logo-icon">
        <LogoPin />
      </span>
      <span>
        Cidade <em>Conectada</em>
      </span>
    </span>
  );
}
