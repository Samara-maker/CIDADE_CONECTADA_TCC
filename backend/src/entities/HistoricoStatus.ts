import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";
import { Administrador } from "./Administrador";

@Entity("historicos_status")
export class HistoricoStatus {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Ocorrencia, (ocorrencia) => ocorrencia.historicos)
  @JoinColumn({ name: "ocorrencia_id" })
  ocorrencia!: Ocorrencia;

  @ManyToOne(() => Administrador, (administrador) => administrador.historicos)
  @JoinColumn({ name: "administrador_id" })
  administrador!: Administrador;

  @Column({ length: 20 })
  status_anterior!: string;

  @Column({ length: 20 })
  status_novo!: string;

  @CreateDateColumn()
  criado_em!: Date;
}
