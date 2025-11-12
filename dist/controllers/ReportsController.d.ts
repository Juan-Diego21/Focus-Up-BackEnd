import { Request, Response } from "express";
export declare class ReportsController {
    createActiveMethod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserReports(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateMethodProgress(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSessionProgress(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const reportsController: ReportsController;
