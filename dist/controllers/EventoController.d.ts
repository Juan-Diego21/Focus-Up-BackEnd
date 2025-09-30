import { Response, Request } from "express";
export declare const eventosController: {
    listEventos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    crearEvento(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteEvento(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateEvento(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
