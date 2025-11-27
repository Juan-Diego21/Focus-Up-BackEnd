import { MusicaEntity } from "./Musica.entity";
export declare class AlbumMusicaEntity {
    idAlbum: number;
    nombreAlbum: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    descripcion: string;
    genero: string;
    musicas?: MusicaEntity[];
    eventos?: any[];
}
