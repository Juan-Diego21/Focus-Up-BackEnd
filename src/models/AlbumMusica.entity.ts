import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("albummusica")
export class AlbumMusicaEntity {
  @PrimaryGeneratedColumn({ name: "id_album" })
  idAlbum!: number;

  @Column({ name: "nombre_album", length: 45, nullable: false, unique: true })
  nombreAlbum!: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @Column({ name: "url_imagen", type: "text", nullable: false })
  urlImagen!: string;
}
