export interface IEventoCreate {
    nombreEvento: string;
    fechaEvento: string;
    horaEvento: string;
    descripcionEvento?: string;
    tipoEvento?: string;
    idUsuario: number;
    idMetodo?: number;
    idAlbum?: number;
    estado?: 'pending' | 'completed' | null;
}
export interface IEventoUpdate {
    nombreEvento?: string;
    fechaEvento?: string;
    horaEvento?: string;
    descripcionEvento?: string;
    tipoEvento?: string;
    idMetodo?: number;
    idAlbum?: number;
    estado?: 'pending' | 'completed' | null;
}
