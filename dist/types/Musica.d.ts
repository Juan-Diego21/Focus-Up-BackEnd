export interface Musica {
    idCancion: number;
    nombreCancion: string;
    artistaCancion?: string | null;
    generoCancion?: string | null;
    categoriaMusica?: string | null;
    idAlbum?: number | null;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
    urlMusica: string;
}
export interface Album {
    id_album: number;
    nombre_album: string;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    descripcion?: string | null;
    genero?: string | null;
}
