import { Request, Response } from "express";
type IdParams = {
    id: string;
};
type MetodoBeneficioParams = {
    id_metodo: string;
    id_beneficio: string;
};
export declare class MetodoEstudioController {
    createMetodoEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMetodoEstudioById(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateMetodoEstudio(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteMetodoEstudio(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllMetodosEstudio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getBeneficiosForMetodo(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    addBeneficioToMetodo(req: Request<MetodoBeneficioParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    removeBeneficioFromMetodo(req: Request<MetodoBeneficioParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const metodoEstudioController: MetodoEstudioController;
export {};
