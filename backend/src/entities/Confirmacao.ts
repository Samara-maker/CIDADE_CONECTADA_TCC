import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";
import { Cidadao } from "./Cidadao";

@Entity("confirmacoes")
export class Confirmacao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Ocorrencia, (ocorrencia) => ocorrencia.confirmacoes)
  @JoinColumn({ name: "ocorrencia_id" })
  ocorrencia!: Ocorrencia;

  @ManyToOne(() => Cidadao, (cidadao) => cidadao.confirmacoes)
  @JoinColumn({ name: "cidadao_id" })
  cidadao!: Cidadao;

  @CreateDateColumn()
  data!: Date;
}
