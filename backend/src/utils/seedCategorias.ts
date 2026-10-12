import "reflect-metadata";
import "dotenv/config";
import { AppDataSource } from "../config/data-source";
import { Secretaria } from "../entities/Secretaria";
import { Categoria } from "../entities/Categoria";

const SECRETARIAS = [
  { nome: "Obras e Infraestrutura", sigla: "SEMOB" },
  { nome: "Serviços Urbanos", sigla: "SEMSU" },
  { nome: "SAAE Saneamento", sigla: "SAAE" },
];

const CATEGORIAS = [
  { nome: "Vias e Pavimentação", icone: "via", prazo_padrao_dias: 3, secretaria: "SEMOB" },
  { nome: "Iluminação Pública", icone: "luz", prazo_padrao_dias: 5, secretaria: "SEMSU" },
  { nome: "Limpeza Urbana", icone: "lixo", prazo_padrao_dias: 2, secretaria: "SEMSU" },
  { nome: "Saneamento Básico", icone: "agua", prazo_padrao_dias: 3, secretaria: "SAAE" },
  { nome: "Obras e Infraestrutura", icone: "obra", prazo_padrao_dias: 10, secretaria: "SEMOB" },
  { nome: "Meio Ambiente", icone: "arvore", prazo_padrao_dias: 7, secretaria: "SEMSU" },
];

async function executar() {
  await AppDataSource.initialize();
  console.log("Conectado ao banco. Iniciando seed...");

  const repositorioSecretaria = AppDataSource.getRepository(Secretaria);
  const repositorioCategoria = AppDataSource.getRepository(Categoria);

  const mapaSecretarias = new Map<string, Secretaria>();

  for (const dados of SECRETARIAS) {
    let secretaria = await repositorioSecretaria.findOne({ where: { sigla: dados.sigla } });

    if (!secretaria) {
      secretaria = repositorioSecretaria.create(dados);
      secretaria = await repositorioSecretaria.save(secretaria);
      console.log(`Secretaria criada: ${secretaria.nome}`);
    }

    mapaSecretarias.set(dados.sigla, secretaria);
  }

  for (const dados of CATEGORIAS) {
    const existente = await repositorioCategoria.findOne({ where: { nome: dados.nome } });

    if (existente) {
      continue;
    }

    const secretaria = mapaSecretarias.get(dados.secretaria);

    if (!secretaria) {
      continue;
    }

    const categoria = repositorioCategoria.create({
      nome: dados.nome,
      icone: dados.icone,
      prazo_padrao_dias: dados.prazo_padrao_dias,
      secretaria,
    });

    await repositorioCategoria.save(categoria);
    console.log(`Categoria criada: ${categoria.nome}`);
  }

  console.log("Seed finalizado com sucesso.");
  await AppDataSource.destroy();
}

executar().catch((erro) => {
  console.error("Erro ao executar o seed:", erro);
  process.exit(1);
});
