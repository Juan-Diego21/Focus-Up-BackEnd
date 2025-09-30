export interface IEventoCreate {
    fechaEvento: Date;
    horaEvento: string;
    nombreEvento: string;
    descripcionEvento: string;
}
export interface IEventoUpdate {
    fechaEvento?: Date;
    horaEvento?: string;
    nombreEvento?: string;
    descripcionEvento?: string;
}
