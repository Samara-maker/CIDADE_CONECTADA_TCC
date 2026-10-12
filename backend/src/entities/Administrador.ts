import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Secretaria } from "./Secretaria";
import { HistoricoStatus } from "./HistoricoStatus";
import { ObservacaoInterna } from "./ObservacaoInterna";

@Entity("administradores")
export class Administrador {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 150 })
  nome!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  // Fica vazia para administradores que entram apenas pelo Google
  @Column({ type: "varchar", nullable: true })
  senha!: string | null;

  @Column({ default: true })
  ativo!: boolean;

  @ManyToOne(() => Secretaria, (secretaria) => secretaria.administradores, { nullable: true })
  @JoinColumn({ name: "secretaria_id" })
  secretaria!: Secretaria | null;

  @CreateDateColumn()
  criado_em!: Date;

  @OneToMany(() => HistoricoStatus, (historico) => historico.administrador)
  historicos!: HistoricoStatus[];

  @OneToMany(() => ObservacaoInterna, (observacao) => observacao.administrador)
  observacoes!: ObservacaoInterna[];
}
