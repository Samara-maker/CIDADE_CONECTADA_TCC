import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";
import { Administrador } from "./Administrador";

@Entity("observacoes_internas")
export class ObservacaoInterna {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Ocorrencia, (ocorrencia) => ocorrencia.observacoes)
  @JoinColumn({ name: "ocorrencia_id" })
  ocorrencia!: Ocorrencia;

  @ManyToOne(() => Administrador, (administrador) => administrador.observacoes)
  @JoinColumn({ name: "administrador_id" })
  administrador!: Administrador;

  @Column({ length: 500 })
  texto!: string;

  @CreateDateColumn()
  criado_em!: Date;
}
