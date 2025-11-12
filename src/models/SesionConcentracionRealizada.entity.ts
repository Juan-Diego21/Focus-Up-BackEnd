import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { MusicaEntity } from "./Musica.entity";
import { MetodoRealizadoEntity } from "./MetodoRealizado.entity";

export enum SesionEstado {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  COMPLETADA = "completada",
  CANCELADA = "cancelada",
}

@Entity("sesiones_concentracion_realizadas")
export class SesionConcentracionRealizadaEntity {
  @PrimaryGeneratedColumn({ name: "id_sesion_realizada" })
  idSesionRealizada!: number;

  @Column({ name: "id_metodo_realizado", type: "integer", nullable: true })
  idMetodoRealizado!: number;

  @Column({ name: "id_cancion", type: "integer", nullable: true })
  idCancion!: number;

  @Column({ name: "fecha_programada", type: "timestamp", nullable: true })
  fechaProgramada!: Date;

  @Column({
    name: "estado",
    type: "varchar",
    length: 20,
    default: SesionEstado.PENDIENTE,
  })
  estado!: SesionEstado;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  // Relations
  @ManyToOne(() => MetodoRealizadoEntity)
  @JoinColumn({ name: "id_metodo_realizado", referencedColumnName: "idMetodoRealizado" })
  metodoRealizado?: MetodoRealizadoEntity;

  @ManyToOne(() => MusicaEntity)
  @JoinColumn({ name: "id_cancion", referencedColumnName: "idCancion" })
  musica?: MusicaEntity;
}