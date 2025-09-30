import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity("interes")
export class InterestEntity {
  @PrimaryGeneratedColumn({ name: "id_interes" })
  idInteres!: number;

  @Column({ length: 100, nullable: false, unique: true })
  nombre!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string;
}