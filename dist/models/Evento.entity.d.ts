import { MetodoEstudioEntity } from "./MetodoEstudio.entity";
import { UserEntity } from "./User.entity";
import { AlbumMusicaEntity } from "./AlbumMusica.entity";
export declare class EventoEntity {
    idEvento: number;
    nombreEvento: string;
    fechaEvento: string;
    horaEvento: string;
    descripcionEvento?: string;
    tipoEvento?: string;
    estado?: 'pendiente' | 'completado' | null;
    usuario: UserEntity;
    metodoEstudio: MetodoEstudioEntity;
    album?: AlbumMusicaEntity;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}
