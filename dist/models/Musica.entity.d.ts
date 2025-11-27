import { AlbumMusicaEntity } from "./AlbumMusica.entity";
export declare class MusicaEntity {
    idCancion: number;
    nombreCancion: string;
    artistaCancion: string;
    generoCancion: string;
    categoriaMusica: string;
    idAlbum: number;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    urlMusica: string;
    album?: AlbumMusicaEntity;
}
