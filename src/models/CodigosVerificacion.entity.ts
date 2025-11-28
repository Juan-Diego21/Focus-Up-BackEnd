import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("codigos_verificacion")
export class CodigosVerificacionEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ name: "email", length: 150, nullable: false })
  email!: string;

  @Column({ name: "codigo", length: 10, nullable: false })
  codigo!: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @Column({ name: "expira_en", type: "timestamp", nullable: false })
  expiraEn!: Date;

  @Column({ name: "intentos", type: "integer", default: 0 })
  intentos!: number;

  @Column({ name: "max_intentos", type: "integer", default: 5 })
  maxIntentos!: number;
}