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
import { EventoEntity } from "./Evento.entity";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { AlbumMusicaEntity } from "./AlbumMusica.entity";

/**
 * Entidad que representa una sesión de concentración en la base de datos
 * Gestiona las sesiones de estudio con temporizadores, métodos y música asociada
 */
@Entity("sesiones_concentracion")
export class SesionConcentracionEntity {
  @PrimaryGeneratedColumn({ name: "id_sesion" })
  idSesion!: number;

  @Column({ name: "id_usuario", type: "integer" })
  idUsuario!: number;

  @Column({ name: "titulo", type: "varchar", length: 150, nullable: true })
  titulo?: string;

  @Column({ name: "descripcion", type: "text", nullable: true })
  descripcion?: string;

  @Column({
    name: "estado",
    type: "varchar",
    length: 20,
    default: "pendiente",
  })
  estado!: "pendiente" | "completada";

  @Column({
    name: "tipo",
    type: "varchar",
    length: 20,
  })
  tipo!: "rapid" | "scheduled";

  @Column({ name: "id_evento", type: "integer", nullable: true })
  idEvento?: number;

  @Column({ name: "id_metodo", type: "integer", nullable: true })
  idMetodo?: number;

  @Column({ name: "id_album", type: "integer", nullable: true })
  idAlbum?: number;

  @Column({
    name: "tiempo_transcurrido",
    type: "interval",
    default: "00:00:00",
  })
  tiempoTranscurrido!: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @Column({
    name: "ultima_interaccion",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  ultimaInteraccion!: Date;

  // Relaciones
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "id_usuario", referencedColumnName: "idUsuario" })
  usuario?: UserEntity;

  @ManyToOne(() => EventoEntity)
  @JoinColumn({ name: "id_evento", referencedColumnName: "idEvento" })
  evento?: EventoEntity;

  @ManyToOne(() => MetodoEstudioEntity)
  @JoinColumn({ name: "id_metodo", referencedColumnName: "idMetodo" })
  metodo?: MetodoEstudioEntity;

  @ManyToOne(() => AlbumMusicaEntity)
  @JoinColumn({ name: "id_album", referencedColumnName: "idAlbum" })
  album?: AlbumMusicaEntity;
}