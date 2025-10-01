import { Request, Response } from "express";
export declare class BeneficioController {
    createBeneficio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getBeneficioById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateBeneficio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteBeneficio(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllBeneficios(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const beneficioController: BeneficioController;
