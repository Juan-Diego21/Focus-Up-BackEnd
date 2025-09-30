import { MetodoEstudio } from "./MedotoEstudio.entity";
export declare class EventoEntity {
    idEvento: number;
    nombreEvento: string;
    fechaEvento?: Date;
    horaEvento: Date;
    descripcionEvento: string;
    metodoEstudio: MetodoEstudio;
}
