import {  Entity,
  PrimaryGeneratedColumn,
  Column,OneToMany} from  "typeorm";
import { EventoEntity} from '../models/Evento.entity'
@Entity("bibliotecametodosestudio")
export class MetodoEstudio {
  @PrimaryGeneratedColumn({ name: "id_metodo" })
  idMetodo!: number;

  @Column({ name: "nombre_metodo" })
  nombreMetodo!: string;

  @Column({ name: "descripcion", type: "text" })
  descripcion!: string;
  @OneToMany(() => EventoEntity, evento => evento.metodoEstudio)
  eventos: EventoEntity[];

}
