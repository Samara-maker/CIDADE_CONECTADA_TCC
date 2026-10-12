import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";
import { Confirmacao } from "./Confirmacao";

@Entity("cidadaos")
export class Cidadao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  // Fica vazia para quem entra apenas pelo Google
  @Column({ type: "varchar", nullable: true })
  senha!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true, unique: true })
  google_id!: string | null;

  @Column({ length: 20, nullable: true })
  telefone!: string;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  criado_em!: Date;

  @OneToMany(() => Ocorrencia, (ocorrencia) => ocorrencia.cidadao)
  ocorrencias!: Ocorrencia[];

  @OneToMany(() => Confirmacao, (confirmacao) => confirmacao.cidadao)
  confirmacoes!: Confirmacao[];
}
