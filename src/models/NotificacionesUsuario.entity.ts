import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn
} from "typeorm";
import { UserEntity } from "./User.entity";

/**
 * Entidad que representa las preferencias de notificaciones de un usuario
 * Gestiona las configuraciones de notificaciones para eventos, métodos pendientes, sesiones pendientes y motivación
 */
@Entity("notificaciones_usuario")
export class NotificacionesUsuarioEntity {
  @PrimaryColumn({ name: "id_usuario" })
  idUsuario!: number;

  // Relación uno a uno con usuario
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "id_usuario" })
  usuario!: UserEntity;

  // Preferencia para notificaciones de eventos
  @Column({ name: "eventos", type: "boolean", default: true })
  eventos!: boolean;

  // Preferencia para notificaciones de métodos pendientes
  @Column({ name: "metodos_pendientes", type: "boolean", default: true })
  metodosPendientes!: boolean;

  // Preferencia para notificaciones de sesiones pendientes
  @Column({ name: "sesiones_pendientes", type: "boolean", default: true })
  sesionesPendientes!: boolean;

  // Preferencia para notificaciones de motivación
  @Column({ name: "motivacion", type: "boolean", default: true })
  motivacion!: boolean;

  // Timestamp de actualización automática
  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;
}