import { Request, Response } from "express";
export declare class MusicController {
    getAllCanciones(req: Request, res: Response): Promise<void>;
    getCancionById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCancionByNombre(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllAlbums(req: Request, res: Response): Promise<void>;
    getCancionesByAlbum(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAlbumById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAlbumByNombre(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const musicController: MusicController;
