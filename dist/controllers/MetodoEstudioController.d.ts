import { Request, Response } from "express";
export declare class MetodoEstudioController {
    createMetodoEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMetodoEstudioById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateMetodoEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteMetodoEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllMetodosEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getBeneficiosForMetodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addBeneficioToMetodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeBeneficioFromMetodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const metodoEstudioController: MetodoEstudioController;
