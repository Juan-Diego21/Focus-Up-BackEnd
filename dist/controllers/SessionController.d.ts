import { Request, Response } from "express";
type SessionIdParams = {
    sessionId: string;
};
type UserIdParams = {
    userId: string;
};
type EventIdParams = {
    eventId: string;
};
type PaginationQuery = {
    page?: string;
    perPage?: string;
};
type DaysQuery = {
    days?: string;
};
export declare class SessionController {
    private sessionService;
    createSession(req: Request, res: Response): Promise<void>;
    getSession(req: Request<SessionIdParams>, res: Response): Promise<void>;
    listUserSessions(req: Request<UserIdParams, {}, {}, PaginationQuery>, res: Response): Promise<void>;
    updateSession(req: Request<SessionIdParams>, res: Response): Promise<void>;
    getPendingAgedSessions(req: Request<{}, {}, {}, DaysQuery>, res: Response): Promise<void>;
    createSessionFromEvent(req: Request<EventIdParams>, res: Response): Promise<void>;
}
export {};
