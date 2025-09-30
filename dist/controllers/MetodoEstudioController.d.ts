import { Response, Request } from "express";
export declare const MetodoEstudioController: {
    getMetodoList(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMetodoByname(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getMetodoById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
export default MetodoEstudioController;
