import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { BeneficioEntity } from "./Beneficio.entity";

@Entity("bibliotecametodosestudio")
export class MetodoEstudioEntity {
  @PrimaryGeneratedColumn({ name: "id_metodo" })
  idMetodo!: number;

  @Column({ name: "nombre_metodo", length: 255, nullable: false })
  nombreMetodo!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: "fecha_actualizacion" })
  fechaActualizacion!: Date;

  @ManyToMany(() => BeneficioEntity, (beneficio) => beneficio.metodos)
  @JoinTable({
    name: "metodobeneficios",
    joinColumn: { name: "id_metodo", referencedColumnName: "idMetodo" },
    inverseJoinColumn: {
      name: "id_beneficio",
      referencedColumnName: "idBeneficio",
    },
  })
  beneficios?: BeneficioEntity[];

  // Uno a muchos con EventoEntity
  eventos?: any[]; // Para la relación inversa con EventoEntity
}
