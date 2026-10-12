import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";
import { Cidadao } from "./Cidadao";

// Avaliação de satisfação feita pelo cidadão depois que a ocorrência é resolvida.
// nota: 1 insatisfeito, 2 neutro, 3 satisfeito, 4 muito satisfeito
@Entity("avaliacoes")
export class Avaliacao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => Ocorrencia)
  @JoinColumn({ name: "ocorrencia_id" })
  ocorrencia!: Ocorrencia;

  @ManyToOne(() => Cidadao)
  @JoinColumn({ name: "cidadao_id" })
  cidadao!: Cidadao;

  @Column({ type: "int" })
  nota!: number;

  @Column({ type: "text", nullable: true })
  comentario!: string | null;

  @CreateDateColumn()
  criado_em!: Date;
}
