export interface InfoStatus {
  rotulo: string;
  classe: string;
  progresso: number;
  etapa: string;
}

const STATUS: Record<string, InfoStatus> = {
  registrada: { rotulo: "Aberto", classe: "aberto", progresso: 15, etapa: "Notificação recebida" },
  em_analise: { rotulo: "Em análise", classe: "aberto", progresso: 30, etapa: "Em triagem" },
  encaminhada: { rotulo: "Encaminhada", classe: "andamento", progresso: 50, etapa: "Encaminhada à secretaria" },
  em_execucao: { rotulo: "Em andamento", classe: "andamento", progresso: 70, etapa: "Equipe designada e em campo" },
  concluida: { rotulo: "Resolvido", classe: "resolvido", progresso: 100, etapa: "Problema resolvido" },
  indeferida: { rotulo: "Indeferido", classe: "indeferido", progresso: 100, etapa: "Notificação indeferida" },
};

export const STATUS_OPCOES = [
  { valor: "registrada", rotulo: "Registrada" },
  { valor: "em_analise", rotulo: "Em análise" },
  { valor: "encaminhada", rotulo: "Encaminhada" },
  { valor: "em_execucao", rotulo: "Em execução" },
  { valor: "concluida", rotulo: "Concluída" },
  { valor: "indeferida", rotulo: "Indeferida" },
];

export function infoStatus(status: string): InfoStatus {
  return STATUS[status] ?? STATUS.registrada;
}

export function encerrada(status: string): boolean {
  return status === "concluida" || status === "indeferida";
}

// "Urgente" só aparece enquanto a notificação ainda está aberta
export function selo(status: string, urgencia: string): { rotulo: string; classe: string } {
  if (urgencia === "alta" && !encerrada(status)) {
    return { rotulo: "Urgente", classe: "urgente" };
  }
  const info = infoStatus(status);
  return { rotulo: info.rotulo, classe: info.classe };
}

// Cor do ponto no mapa e da bolinha da lista
export function corMapa(status: string, urgencia: string): string {
  if (urgencia === "alta" && !encerrada(status)) return "#ef1c34";
  if (status === "concluida") return "#3f8f47";
  if (status === "indeferida") return "#9ca3af";
  if (status === "encaminhada" || status === "em_execucao") return "#3b82f6";
  return "#ffc61a";
}

// Cor da barra de progresso
export function corBarra(status: string, urgencia = "media"): { forte: string; fraca: string } {
  if (urgencia === "alta" && !encerrada(status)) return { forte: "#065f2c", fraca: "#cfe0d4" };
  if (status === "registrada" || status === "em_analise") return { forte: "#fdc21a", fraca: "#f8edd7" };
  if (status === "encaminhada" || status === "em_execucao") return { forte: "#3b82f6", fraca: "#dbeafe" };
  return { forte: "#065f2c", fraca: "#cfe0d4" };
}

const VISUAL_CATEGORIA: Record<string, string> = {
  via: "#6b7280",
  luz: "#111827",
  lixo: "#111827",
  agua: "#4f46e5",
  obra: "#111827",
  arvore: "#16a34a",
};

export function corCategoria(icone: string): string {
  return VISUAL_CATEGORIA[icone] ?? "#111827";
}

export function rotuloUrgencia(urgencia: string): string {
  if (urgencia === "alta") return "Urgente";
  if (urgencia === "baixa") return "Baixo";
  return "Moderado";
}

// CC-2026-000012 vira #2026-000012, como aparece no protótipo
export function protocoloCurto(protocolo: string): string {
  return `#${protocolo.replace(/^CC-/, "")}`;
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function horasDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3600000));
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// Título usado nas listas, como "Vias e Pavimentação · Av. Sete de Setembro, 340"
export function tituloOcorrencia(item: { categoria: { nome: string }; endereco: string }): string {
  return `${item.categoria.nome} · ${item.endereco}`;
}

export function nivelCidadao(total: number): "ouro" | "prata" | "bronze" {
  if (total >= 5) return "ouro";
  if (total >= 1) return "prata";
  return "bronze";
}

export function formatarDias(dias: number | null): string {
  return dias === null ? "-" : `${String(dias).replace(".", ",")}d`;
}

export function baixarCsv(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]) {
  const escapar = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`;
  const conteudo = [cabecalho, ...linhas].map((linha) => linha.map(escapar).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function mensagemErro(erro: unknown, padrao: string): string {
  const resposta = (erro as { response?: { data?: { erro?: string } } })?.response;
  return resposta?.data?.erro || padrao;
}

// CC-2026-000012 vira #0012, usado nas tabelas do painel
export function numeroProtocolo(protocolo: string): string {
  return `#${(protocolo.split("-").pop() ?? "").slice(-4)}`;
}

const ORDEM_CATEGORIAS = ["via", "luz", "lixo", "agua", "obra", "arvore"];

// Ordem fixa das categorias, como aparece no protótipo
export function ordenarCategorias<T extends { icone: string }>(lista: T[]): T[] {
  const posicao = (icone: string) => {
    const i = ORDEM_CATEGORIAS.indexOf(icone);
    return i === -1 ? 99 : i;
  };
  return [...lista].sort((a, b) => posicao(a.icone) - posicao(b.icone));
}

export function pluralCasos(total: number): string {
  return `${total} ${total === 1 ? "caso" : "casos"}`;
}
