import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MusicaEntity } from "./Musica.entity";

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

  @Column({ name: "descripcion", type: "text", nullable: true })
  descripcion!: string;

  @Column({ name: "genero", length: 50, nullable: true })
  genero!: string;

  // Relationship with Music
  @OneToMany(() => MusicaEntity, musica => musica.album)
  musicas?: MusicaEntity[];

  // Relación con eventos (uno a muchos)
  eventos?: any[]; // Para la relación inversa con EventoEntity
}
