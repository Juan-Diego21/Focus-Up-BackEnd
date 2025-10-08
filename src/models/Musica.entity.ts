import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("musica")
export class MusicaEntity {
  @PrimaryGeneratedColumn({ name: "id_cancion" })
  idCancion!: number;

  @Column({ name: "nombre_cancion", length: 45, nullable: false })
  nombreCancion!: string;

  @Column({ name: "artista_cancion", length: 45, nullable: true })
  artistaCancion!: string;

  @Column({ name: "genero_cancion", length: 45, nullable: true })
  generoCancion!: string;

  @Column({ name: "categoria_musica", length: 30, nullable: true })
  categoriaMusica!: string;

  @Column({ name: "id_album", type: "integer", nullable: true })
  idAlbum!: number;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @Column({ name: "url_musica", type: "text", nullable: false })
  urlMusica!: string;

  @Column({ name: "url_imagen", type: "text", nullable: false })
  urlImagen!: string;
}
