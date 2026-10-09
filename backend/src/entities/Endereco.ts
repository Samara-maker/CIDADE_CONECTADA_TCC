import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Ocorrencia } from "./Ocorrencia";

@Entity("enderecos")
export class Endereco {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  logradouro!: string;

  @Column({ length: 20, nullable: true })
  numero!: string;

  @Column({ length: 100, nullable: true })
  bairro!: string;

  @Column({ length: 100, default: "Ji-Paraná" })
  cidade!: string;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  longitude!: number;

  @OneToOne(() => Ocorrencia, (ocorrencia) => ocorrencia.endereco)
  ocorrencia!: Ocorrencia;
}
