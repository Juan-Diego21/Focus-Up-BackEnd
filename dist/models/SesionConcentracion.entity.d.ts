import { UserEntity } from "./User.entity";
import { EventoEntity } from "./Evento.entity";
import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { AlbumMusicaEntity } from "./AlbumMusica.entity";
export declare class SesionConcentracionEntity {
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
    usuario?: UserEntity;
    evento?: EventoEntity;
    metodo?: MetodoEstudioEntity;
    album?: AlbumMusicaEntity;
}
