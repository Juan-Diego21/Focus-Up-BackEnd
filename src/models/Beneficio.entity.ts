import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";

@Entity("beneficios")
export class BeneficioEntity {
  @PrimaryGeneratedColumn({ name: "id_beneficio" })
  idBeneficio!: number;

  @Column({ name: "descripcion_beneficio", type: "text", nullable: false })
  descripcionBeneficio!: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @ManyToMany(() => MetodoEstudioEntity, metodo => metodo.beneficios)
  metodos?: MetodoEstudioEntity[];
}