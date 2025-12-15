export interface ISession {
    idSesion: number;
    idUsuario: number;
    titulo?: string;
    descripcion?: string;
    estado: "pendiente" | "completada";
    tipo: "rapid" | "scheduled";
    idEvento?: number;
    idMetodo?: number;
    idAlbum?: number;
    tiempoTranscurrido: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    ultimaInteraccion: Date;
}
export interface ICreateSession {
    titulo?: string;
    descripcion?: string;
    tipo: "rapid" | "scheduled";
    idEvento?: number;
    idMetodo?: number;
    idAlbum?: number;
    tiempoTranscurrido?: string;
}
export interface IUpdateSession {
    titulo?: string;
    descripcion?: string;
    idMetodo?: number;
    idAlbum?: number;
}
export interface ISessionResponse extends ISession {
    elapsedInterval?: string;
    elapsedMs?: number;
    createdAt?: string;
    updatedAt?: string;
    lastInteractionAt?: string;
}
