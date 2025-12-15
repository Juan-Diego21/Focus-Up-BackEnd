import { Request, Response } from 'express';
export declare class NotificacionesProgramadasController {
    private notificacionesService;
    createScheduledNotification(req: Request, res: Response): Promise<void>;
    getScheduledNotifications(req: Request, res: Response): Promise<void>;
    markAsSent(req: Request, res: Response): Promise<void>;
}
