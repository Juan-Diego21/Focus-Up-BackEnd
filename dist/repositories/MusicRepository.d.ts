import { Musica, Album } from "../types/Musica";
export declare class MusicRepository {
    private musicaRepo;
    private albumRepo;
    constructor();
    private mapToMusicaDTO;
    private mapToAlbumDTO;
    findAll(): Promise<Musica[]>;
    findById(id: number): Promise<Musica | null>;
    findByNombre(nombre: string): Promise<Musica[]>;
    findByAlbumId(albumId: number): Promise<Musica[]>;
    findAllAlbums(): Promise<Album[]>;
    findAlbumById(id: number): Promise<Album | null>;
    findAlbumByNombre(nombre: string): Promise<Album | null>;
}
export declare const musicRepository: MusicRepository;
