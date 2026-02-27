import { Request, Response } from 'express';
type IdParams = {
    id: string;
};
export declare class NotificacionesProgramadasController {
    private notificacionesService;
    createScheduledNotification(req: Request, res: Response): Promise<void>;
    getScheduledNotifications(req: Request, res: Response): Promise<void>;
    markAsSent(req: Request<IdParams>, res: Response): Promise<void>;
}
export {};
