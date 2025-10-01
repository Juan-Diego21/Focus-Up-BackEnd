export interface Musica {
  id_cancion: number;
  nombre_cancion: string;
  artista_cancion?: string | null;
  genero_cancion?: string | null;
  categoria_musica?: string | null;
  id_album?: number | null;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  url_archivo: string;
}

export interface Album {
  id_album: number;
  nombre_album: string;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}
