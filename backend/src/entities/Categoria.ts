import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Secretaria } from "./Secretaria";
import { Ocorrencia } from "./Ocorrencia";

@Entity("categorias")
export class Categoria {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  nome!: string;

  @Column({ length: 50 })
  icone!: string;

  @Column({ type: "int", default: 5 })
  prazo_padrao_dias!: number;

  @ManyToOne(() => Secretaria, (secretaria) => secretaria.categorias)
  @JoinColumn({ name: "secretaria_id" })
  secretaria!: Secretaria;

  @Column({ default: true })
  ativa!: boolean;

  @OneToMany(() => Ocorrencia, (ocorrencia) => ocorrencia.categoria)
  ocorrencias!: Ocorrencia[];
}
