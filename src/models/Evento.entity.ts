import {Entity,Column,
    ManyToOne,JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";

@Entity("eventos")
export class EventoEntity{
    @PrimaryGeneratedColumn({name:"id_evento" })
    idEvento!: number;
    @Column({name:"nombre_evento"})
    nombreEvento!:string;
    @Column({name:"fecha_evento"})
    fechaEvento?:Date;
    @Column({name:"hora_evento"})
    horaEvento!:string;
    @Column({type:"text",name:"descripcion_evento"})
    descripcionEvento!:string;



    //Conexion con metodos de estudio
    @ManyToOne(() => MetodoEstudioEntity, metodo => metodo.eventos)
    @JoinColumn({ name: "id_metodo" })
    metodoEstudio: MetodoEstudioEntity;
    //Conexion con la biblioteca de musica
    



}