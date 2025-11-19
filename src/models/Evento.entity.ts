import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { UserEntity } from "./User.entity";
import { AlbumMusicaEntity } from "./AlbumMusica.entity";

/**
 * Entidad que representa un evento de estudio en la base de datos
 * Gestiona la información de eventos asociados a usuarios, métodos de estudio y álbumes de música
 */
@Entity("eventos")
export class EventoEntity {
  @PrimaryGeneratedColumn({ name: "id_evento" })
  idEvento!: number;

  @Column({ name: "nombre_evento", length: 100, nullable: false })
  nombreEvento!: string;

  @Column({ name: "fecha_evento", type: "date", nullable: false })
  fechaEvento!: Date;

  @Column({ name: "hora_evento", type: "time", nullable: false })
  horaEvento!: string;

  @Column({ type: "text", name: "descripcion_evento", nullable: true })
  descripcionEvento?: string;

  // Relación con usuario (obligatoria)
  @ManyToOne(() => UserEntity, usuario => usuario.eventos)
  @JoinColumn({ name: "id_usuario" })
  usuario!: UserEntity;

  // Relación con método de estudio (obligatoria)
  @ManyToOne(() => MetodoEstudioEntity, metodo => metodo.eventos)
  @JoinColumn({ name: "id_metodo" })
  metodoEstudio!: MetodoEstudioEntity;

  // Relación con álbum de música (opcional)
  @ManyToOne(() => AlbumMusicaEntity, album => album.eventos)
  @JoinColumn({ name: "id_album" })
  album?: AlbumMusicaEntity;

  // Timestamps automáticos
  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;
}