import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Secretaria } from "./Secretaria";
import { Ocorrencia } from "./Ocorrencia";

@Entity("equipes_campo")
export class EquipeCampo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ length: 20, nullable: true })
  telefone!: string;

  @ManyToOne(() => Secretaria, (secretaria) => secretaria.equipes)
  @JoinColumn({ name: "secretaria_id" })
  secretaria!: Secretaria;

  @Column({ default: true })
  ativa!: boolean;

  @OneToMany(() => Ocorrencia, (ocorrencia) => ocorrencia.equipeCampo)
  ocorrencias!: Ocorrencia[];
}
