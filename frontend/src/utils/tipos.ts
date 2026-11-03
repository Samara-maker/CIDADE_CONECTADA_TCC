export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  prazo_padrao_dias: number;
  secretaria?: { id: string; nome: string; sigla: string };
}

export interface OcorrenciaPublica {
  id: string;
  protocolo: string;
  descricao: string;
  status: string;
  nivel_urgencia: string;
  criado_em: string;
  categoria: { id: string; nome: string; icone: string };
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface Satisfacao {
  total_avaliacoes: number;
  taxa: number;
  muito_satisfeito: number;
  satisfeito: number;
  neutro: number;
  insatisfeito: number;
}

export interface Resumo {
  abertas: number;
  em_resolucao: number;
  resolvidas: number;
  indeferidas: number;
  total: number;
  tempo_medio_dias: number | null;
  total_cidadaos: number;
  satisfacao: Satisfacao;
  por_categoria: { id: string; nome: string; icone: string; total: number }[];
  por_secretaria: { id: string; nome: string; sigla: string; total: number; tempo_medio_dias: number | null }[];
}
