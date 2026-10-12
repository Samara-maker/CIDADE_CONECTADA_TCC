import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Categoria } from "../entities/Categoria";

const repositorioCategoria = AppDataSource.getRepository(Categoria);

export async function listarCategorias(_req: Request, res: Response): Promise<void> {
  const categorias = await repositorioCategoria.find({
    where: { ativa: true },
    relations: ["secretaria"],
    order: { nome: "ASC" },
  });

  res.status(200).json(categorias);
}
