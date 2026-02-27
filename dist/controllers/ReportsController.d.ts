import { Request, Response } from "express";
type IdParams = {
    id: string;
};
type UserReportsQuery = {
    userId?: string;
};
export declare class ReportsController {
    createActiveMethod(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserReports(req: Request<{}, {}, {}, UserReportsQuery>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateMethodProgress(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSessionProgress(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserSessionReports(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserMethodReports(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteReport(req: Request<IdParams>, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const reportsController: ReportsController;
export {};
