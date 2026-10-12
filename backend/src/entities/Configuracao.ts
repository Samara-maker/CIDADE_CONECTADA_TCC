import { Entity, PrimaryColumn, Column } from "typeorm";

// Parâmetros simples do sistema, no formato chave e valor.
@Entity("configuracoes")
export class Configuracao {
  @PrimaryColumn({ type: "varchar", length: 60 })
  chave!: string;

  @Column({ type: "varchar", length: 255 })
  valor!: string;
}
