import {  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn} from  "typeorm";

@Entity("bibliotecametodosestudio")
export class MetodoEstudio {
  @PrimaryGeneratedColumn({ name: "id_metodo" })
  idMetodo!: number;

  @Column({ name: "nombre_metodo" })
  nombreMetodo!: string;

  @Column({ name: "descripcion", type: "text" })
  descripcion!: string;
}
