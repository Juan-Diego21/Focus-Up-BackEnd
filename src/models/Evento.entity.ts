import {Entity,PrimaryColumn,Column,
    ManyToOne,JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import {UserEntity} from "./User.entity"

@Entity("eventos")
export class EventoEntity{
    @PrimaryGeneratedColumn({name:"id_evento" })
    idEvento!: number;
    @Column({name:"nombre_ebvento"})
    nombreEvento!:string;
    @Column({name:"fecha_evento"})
    fechaEvento?:Date;
    @Column({name:"hora_evento"})
    horaEvento!:"Time";
    @Column({type:"varchar", length:30})
    descripcionEvento!:"string";

    @ManyToOne(() => UserEntity, user => user.idObjetivoEstudio)
    @JoinColumn({ name: 'id_usuario' })
    usuario: UserEntity;
}