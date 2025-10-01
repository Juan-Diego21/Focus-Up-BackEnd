import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
export declare class EventoEntity {
    idEvento: number;
    nombreEvento: string;
    fechaEvento?: Date;
    horaEvento: string;
    descripcionEvento: string;
    metodoEstudio: MetodoEstudioEntity;
}
