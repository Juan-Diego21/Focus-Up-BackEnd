import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { UserEntity } from "./User.entity";
import { InterestEntity } from "./Interest.entity";

@Entity("usuariointereses")
export class UsuarioInteresesEntity {
  @PrimaryColumn({ name: "id_usuario" })
  idUsuario!: number;

  @PrimaryColumn({ name: "id_interes" })
  idInteres!: number;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_usuario" })
  usuario!: UserEntity;

  @ManyToOne(() => InterestEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_interes" })
  interes!: InterestEntity;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;
}