import {  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn} from  "typeorm";

@Entity("metodosEstudio")
export class MetodoEstudio{
    @PrimaryGeneratedColumn({name:"id_metodo"})
    idMetodo!: number;
    @Column ({name:"nombre_metodo"})
    nombreMetodo!: String;
    @Column({name:"descripcion", type:"text"})
    descripcion !: string;
}
