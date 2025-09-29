import { Musica, Album } from "../types/Musica";
export declare class MusicService {
    getAllCanciones(): Promise<{
        success: boolean;
        canciones?: Musica[];
        error?: string;
    }>;
    getCancionById(id: number): Promise<{
        success: boolean;
        cancion?: Musica;
        error?: string;
    }>;
    getCancionByNombre(nombre: string): Promise<{
        success: boolean;
        canciones?: Musica[];
        error?: string;
    }>;
    getAllAlbums(): Promise<{
        success: boolean;
        albums?: Album[];
        error?: string;
    }>;
    getCancionesByAlbum(idAlbum: number): Promise<{
        success: boolean;
        canciones?: Musica[];
        error?: string;
    }>;
    getAlbumById(id: number): Promise<{
        success: boolean;
        album?: Album;
        error?: string;
    }>;
    getAlbumByNombre(nombre: string): Promise<{
        success: boolean;
        album?: Album;
        error?: string;
    }>;
}
export declare const musicService: MusicService;
