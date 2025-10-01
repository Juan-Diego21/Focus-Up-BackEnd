import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UsuarioInteresesEntity } from "./UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "./UsuarioDistracciones.entity";

@Entity("usuario")
export class UserEntity {
  @PrimaryGeneratedColumn({ name: "id_usuario" })
  idUsuario!: number;

  @Column({ name: "nombre_usuario", length: 50, nullable: false })
  nombreUsuario!: string;

  @Column({ length: 50, nullable: true })
  pais!: string;

  @Column({
    type: "varchar",
    length: 15,
    nullable: true,
  })
  genero!: string;

  @Column({ name: "fecha_nacimiento", type: "date", nullable: true })
  fechaNacimiento!: Date;

  @Column({ name: "horario_fav", type: "time", nullable: true })
  horarioFav!: string;

  @Column({ length: 100, unique: true, nullable: false })
  correo!: string;

  @Column({ length: 255, nullable: false })
  contrasena!: string;

  @Column({ name: "id_objetivo_estudio", type: "integer", nullable: true })
  idObjetivoEstudio!: number;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @OneToMany(() => UsuarioInteresesEntity, usuarioInteres => usuarioInteres.usuario)
  usuarioIntereses?: UsuarioInteresesEntity[];

  @OneToMany(() => UsuarioDistraccionesEntity, usuarioDistraccion => usuarioDistraccion.usuario)
  usuarioDistracciones?: UsuarioDistraccionesEntity[];
}