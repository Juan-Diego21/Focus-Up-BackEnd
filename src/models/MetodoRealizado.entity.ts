import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserEntity } from "./User.entity";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";

export enum MetodoProgreso {
  INICIADO = 0,
  MITAD = 50,
  COMPLETADO = 100,
}

export enum MetodoEstado {
  EN_PROGRESO = "en_progreso",
  COMPLETADO = "completado",
  CANCELADO = "cancelado",
}

@Entity("metodos_realizados")
export class MetodoRealizadoEntity {
  @PrimaryGeneratedColumn({ name: "id_metodo_realizado" })
  idMetodoRealizado!: number;

  @Column({ name: "id_usuario", type: "integer" })
  idUsuario!: number;

  @Column({ name: "id_metodo", type: "integer" })
  idMetodo!: number;

  @Column({
    name: "progreso",
    type: "integer",
    default: MetodoProgreso.INICIADO,
  })
  progreso!: MetodoProgreso;

  @Column({
    name: "estado",
    type: "varchar",
    length: 20,
    default: MetodoEstado.EN_PROGRESO,
  })
  estado!: MetodoEstado;

  @Column({ name: "fecha_inicio", type: "timestamp", nullable: true })
  fechaInicio!: Date;

  @Column({ name: "fecha_fin", type: "timestamp", nullable: true })
  fechaFin!: Date;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "id_usuario", referencedColumnName: "idUsuario" })
  usuario?: UserEntity;

  @ManyToOne(() => MetodoEstudioEntity)
  @JoinColumn({ name: "id_metodo", referencedColumnName: "idMetodo" })
  metodo?: MetodoEstudioEntity;
}