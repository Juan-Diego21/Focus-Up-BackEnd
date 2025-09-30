import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity("distraccion")
export class DistractionEntity {
  @PrimaryGeneratedColumn({ name: "id_distraccion" })
  idDistraccion!: number;

  @Column({ length: 100, nullable: false, unique: true })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string;
}