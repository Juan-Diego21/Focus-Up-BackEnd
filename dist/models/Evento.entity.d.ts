import { MetodoEstudio } from "./MedotoEstudio.entity";
export declare class EventoEntity {
    idEvento: number;
    nombreEvento: string;
    fechaEvento?: Date;
    horaEvento: string;
    descripcionEvento: string;
    metodoEstudio: MetodoEstudio;
}
