import { AppDataSource } from "../config/data-source";
import { Configuracao } from "../entities/Configuracao";

export interface ResultadoJurisdicao {
  competencia: "municipal" | "federal";
  bloqueia: boolean;
  titulo: string;
  texto: string;
  base_legal: string;
  orgao?: string;
  contato?: string;
}

// Lê um parâmetro da tabela de configurações. Se não existir, usa o valor padrão.
export async function lerConfiguracao(chave: string, padrao: string): Promise<string> {
  const registro = await AppDataSource.getRepository(Configuracao).findOne({ where: { chave } });
  return registro ? registro.valor : padrao;
}

// Análise de jurisdição baseada em regras. Identifica rodovias federais pelo nome do endereço.
export async function analisarJurisdicao(
  endereco: string,
  categoria: string,
  secretaria: string
): Promise<ResultadoJurisdicao> {
  if ((await lerConfiguracao("ia_ativa", "true")) !== "true") {
    return { competencia: "municipal", bloqueia: false, titulo: "", texto: "", base_legal: "" };
  }

  const citarLei = (await lerConfiguracao("ia_citar_lei", "true")) === "true";

  const rodoviaFederal = /\bBR[\s-]?\d{2,3}\b/i.test(endereco) || /rodovia federal/i.test(endereco);

  if (rodoviaFederal) {
    const bloquear = (await lerConfiguracao("ia_bloquear_federal", "true")) === "true";

    return {
      competencia: "federal",
      bloqueia: bloquear,
      titulo: "Não é possível prosseguir com o cadastro",
      texto:
        "Este endereço é uma rodovia federal (BR). A Prefeitura não tem competência legal para obras em rodovias federais. A responsabilidade é do DNIT conforme legislação federal.",
      base_legal: !citarLei
        ? ""
        : "De acordo com o Art. 20 da Constituição Federal de 1988 e com a Lei Federal nº 9.636/1998, as faixas de domínio de rodovias federais constituem patrimônio público inalienável e imprescritível.",
      orgao: "DNIT",
      contato: "DNIT: 0800 725 5050 | dnit.gov.br | Sup. Regional RO: (69) 3211-5700",
    };
  }

  return {
    competencia: "municipal",
    bloqueia: false,
    titulo: `Problema de ${categoria.toLowerCase()} em área urbana municipal`,
    texto: `Prefeitura de Ji-Paraná, ${secretaria}. O endereço informado está em uma via urbana, em Ji-Paraná/RO, o que caracteriza responsabilidade do município.`,
    base_legal: !citarLei
      ? ""
      : "A Constituição Federal, em seu Art. 30, inciso V, atribui aos municípios a competência de organizar e prestar serviços de interesse local, incluindo a conservação e a manutenção de vias públicas urbanas.",
  };
}
