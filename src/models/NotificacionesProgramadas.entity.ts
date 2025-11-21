import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from "typeorm";
import { UserEntity } from "./User.entity";

/**
 * Entidad que representa notificaciones programadas para envío futuro
 * Gestiona notificaciones de email que serán enviadas en fechas específicas
 * Soporta diferentes tipos de notificaciones con contenido personalizado
 */
@Entity("notificaciones_programadas")
export class NotificacionesProgramadasEntity {
  @PrimaryGeneratedColumn({ name: "id_notificacion" })
  idNotificacion!: number;

  // Relación con usuario - permite notificaciones personalizadas
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "id_usuario" })
  usuario!: UserEntity;

  @Column({ name: "id_usuario" })
  idUsuario!: number;

  // Tipo de notificación - categoriza el propósito (ej: 'recordatorio', 'motivacion', 'evento')
  @Column({ name: "tipo", type: "varchar", length: 50, nullable: false })
  tipo!: string;

  // Título opcional de la notificación - para el asunto del email
  @Column({ name: "titulo", type: "varchar", length: 255, nullable: true })
  titulo?: string;

  // Contenido del mensaje - cuerpo del email
  @Column({ name: "mensaje", type: "text", nullable: true })
  mensaje?: string;

  // Fecha y hora programada para el envío - debe ser futura
  @Column({ name: "fecha_programada", type: "timestamp", nullable: false })
  fechaProgramada!: Date;

  // Estado de envío - false por defecto, true cuando se marca como enviada
  @Column({ name: "enviada", type: "boolean", default: false })
  enviada!: boolean;

  // Fecha real de envío - se establece cuando se marca como enviada
  @Column({ name: "fecha_envio", type: "timestamp", nullable: true })
  fechaEnvio?: Date;

  // Timestamp automático de creación
  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;
}