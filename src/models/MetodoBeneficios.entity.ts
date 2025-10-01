import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { BeneficioEntity } from "./Beneficio.entity";

@Entity("metodobeneficios")
export class MetodoBeneficiosEntity {
  @PrimaryColumn({ name: "id_metodo" })
  idMetodo!: number;

  @PrimaryColumn({ name: "id_beneficio" })
  idBeneficio!: number;

  @ManyToOne(() => MetodoEstudioEntity, metodo => metodo.beneficios, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_metodo" })
  metodo!: MetodoEstudioEntity;

  @ManyToOne(() => BeneficioEntity, beneficio => beneficio.metodos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "id_beneficio" })
  beneficio!: BeneficioEntity;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;
}