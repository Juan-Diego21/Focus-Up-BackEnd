import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { UserEntity } from "./User.entity";
import { DistractionEntity } from "./Distraction.entity";

@Entity("usuariodistracciones")
export class UsuarioDistraccionesEntity {
  @PrimaryColumn({ name: "id_usuario" })
  idUsuario!: number;

  @PrimaryColumn({ name: "id_distraccion" })
  idDistraccion!: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_usuario" })
  usuario!: UserEntity;

  @ManyToOne(() => DistractionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_distraccion" })
  distraccion!: DistractionEntity;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;
}