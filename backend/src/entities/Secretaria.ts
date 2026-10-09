import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Categoria } from "./Categoria";
import { Administrador } from "./Administrador";
import { EquipeCampo } from "./EquipeCampo";

@Entity("secretarias")
export class Secretaria {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ length: 20, unique: true })
  sigla!: string;

  @Column({ default: true })
  ativa!: boolean;

  @OneToMany(() => Categoria, (categoria) => categoria.secretaria)
  categorias!: Categoria[];

  @OneToMany(() => Administrador, (administrador) => administrador.secretaria)
  administradores!: Administrador[];

  @OneToMany(() => EquipeCampo, (equipe) => equipe.secretaria)
  equipes!: EquipeCampo[];
}
