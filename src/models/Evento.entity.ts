import {Entity,Column,
    ManyToOne,JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { MetodoEstudio } from "./MedotoEstudio.entity";

@Entity("eventos")
export class EventoEntity{
    @PrimaryGeneratedColumn({name:"id_evento" })
    idEvento!: number;
    @Column({name:"nombre_evento"})
    nombreEvento!:string;
    @Column({name:"fecha_evento"})
    fechaEvento?:Date;
    @Column({name:"hora_evento"})
    horaEvento!:Date;
    @Column({type:"varchar", length:30})
    descripcionEvento!:string;



    //Conexion con metodos de estudio
    @ManyToOne(() => MetodoEstudio, metodo => metodo.eventos)
    @JoinColumn({ name: "id_metodo" })
    metodoEstudio: MetodoEstudio;
    //Conexion con la biblioteca de musica
    



}