export interface ICreateScheduledNotification {
    idUsuario: number;
    tipo: string;
    titulo?: string;
    mensaje?: string;
    fechaProgramada: Date;
}
