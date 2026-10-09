import "reflect-metadata";
import { DataSource } from "typeorm";
import { Cidadao } from "../entities/Cidadao";
import { Administrador } from "../entities/Administrador";
import { Categoria } from "../entities/Categoria";
import { Secretaria } from "../entities/Secretaria";
import { EquipeCampo } from "../entities/EquipeCampo";
import { Endereco } from "../entities/Endereco";
import { Ocorrencia } from "../entities/Ocorrencia";
import { HistoricoStatus } from "../entities/HistoricoStatus";
import { ObservacaoInterna } from "../entities/ObservacaoInterna";
import { Confirmacao } from "../entities/Confirmacao";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "cidadeconecta",
  synchronize: true,
  logging: false,
  entities: [
    Cidadao,
    Administrador,
    Categoria,
    Secretaria,
    EquipeCampo,
    Endereco,
    Ocorrencia,
    HistoricoStatus,
    ObservacaoInterna,
    Confirmacao,
  ],
});
