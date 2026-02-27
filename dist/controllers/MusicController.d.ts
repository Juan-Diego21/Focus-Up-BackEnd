import { Request, Response } from "express";
type IdParams = {
    id: string;
};
type NombreParams = {
    nombre: string;
};
type AlbumIdParams = {
    albumId: string;
};
export declare class MusicController {
    getAllCanciones(req: Request, res: Response): Promise<void>;
    getCancionById(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCancionByNombre(req: Request<NombreParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllAlbums(req: Request, res: Response): Promise<void>;
    getCancionesByAlbum(req: Request<AlbumIdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAlbumById(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAlbumByNombre(req: Request<NombreParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const musicController: MusicController;
export {};
