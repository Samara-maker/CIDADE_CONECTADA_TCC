import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Cidadao } from "./Cidadao";
import { Categoria } from "./Categoria";
import { Endereco } from "./Endereco";
import { EquipeCampo } from "./EquipeCampo";
import { HistoricoStatus } from "./HistoricoStatus";
import { ObservacaoInterna } from "./ObservacaoInterna";
import { Confirmacao } from "./Confirmacao";

export type StatusOcorrencia =
  | "registrada"
  | "em_analise"
  | "encaminhada"
  | "em_execucao"
  | "concluida"
  | "indeferida";

export type NivelUrgencia = "baixa" | "media" | "alta";

@Entity("ocorrencias")
export class Ocorrencia {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 30 })
  protocolo!: string;

  @Column({ length: 500 })
  descricao!: string;

  @Column({ type: "varchar", length: 20, default: "media" })
  nivel_urgencia!: NivelUrgencia;

  @Column({ type: "varchar", length: 20, default: "registrada" })
  status!: StatusOcorrencia;

  @Column({ type: "varchar", nullable: true, length: 255 })
  foto_url!: string | null;

  @Column({ type: "date" })
  prazo_sla!: string;

  @ManyToOne(() => Cidadao, (cidadao) => cidadao.ocorrencias)
  @JoinColumn({ name: "cidadao_id" })
  cidadao!: Cidadao;

  @ManyToOne(() => Categoria, (categoria) => categoria.ocorrencias)
  @JoinColumn({ name: "categoria_id" })
  categoria!: Categoria;

  @OneToOne(() => Endereco, (endereco) => endereco.ocorrencia, { cascade: true })
  @JoinColumn({ name: "endereco_id" })
  endereco!: Endereco;

  @ManyToOne(() => EquipeCampo, (equipe) => equipe.ocorrencias, { nullable: true })
  @JoinColumn({ name: "equipe_campo_id" })
  equipeCampo!: EquipeCampo | null;

  @CreateDateColumn()
  criado_em!: Date;

  @OneToMany(() => HistoricoStatus, (historico) => historico.ocorrencia)
  historicos!: HistoricoStatus[];

  @OneToMany(() => ObservacaoInterna, (observacao) => observacao.ocorrencia)
  observacoes!: ObservacaoInterna[];

  @OneToMany(() => Confirmacao, (confirmacao) => confirmacao.ocorrencia)
  confirmacoes!: Confirmacao[];
}
