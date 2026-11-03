export interface OcorrenciaAdmin {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  nivel_urgencia: string;
  prazo_sla: string;
  criado_em: string;
  categoria: { id: string; nome: string; icone: string; prazo_padrao_dias: number; secretaria?: { id: string; nome: string; sigla: string } };
  endereco: string;
  latitude: number;
  longitude: number;
  equipeCampo: { id: string; nome: string } | null;
  cidadao: { id: string; nome: string; email: string } | null;
}

export interface Equipe {
  id: string;
  nome: string;
  telefone: string | null;
  ativa: boolean;
  secretaria: string | null;
  em_andamento: number;
  atuando: string | null;
}

export interface CidadaoAdmin {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  criado_em: string;
  total_ocorrencias: number;
}

export interface DadosPainel {
  ocorrencias: OcorrenciaAdmin[];
  equipes: Equipe[];
  cidadaos: CidadaoAdmin[];
}

export function ordenarPorUrgencia(lista: OcorrenciaAdmin[]): OcorrenciaAdmin[] {
  const peso = (o: OcorrenciaAdmin) => (o.nivel_urgencia === "alta" ? 0 : o.nivel_urgencia === "media" ? 1 : 2);
  const fechada = (o: OcorrenciaAdmin) => (o.status === "concluida" || o.status === "indeferida" ? 1 : 0);

  return [...lista].sort(
    (a, b) =>
      fechada(a) - fechada(b) ||
      peso(a) - peso(b) ||
      new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  );
}
