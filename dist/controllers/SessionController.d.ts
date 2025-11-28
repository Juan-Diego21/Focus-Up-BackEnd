import { Request, Response } from "express";
export declare class SessionController {
    private sessionService;
    private notificationService;
    createSession(req: Request, res: Response): Promise<void>;
    getSession(req: Request, res: Response): Promise<void>;
    listUserSessions(req: Request, res: Response): Promise<void>;
    updateSession(req: Request, res: Response): Promise<void>;
    getPendingAgedSessions(req: Request, res: Response): Promise<void>;
    createSessionFromEvent(req: Request, res: Response): Promise<void>;
}
