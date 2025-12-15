import { IBaseRepository } from "./IBaseRepository";
import { ISession, ICreateSession, IUpdateSession } from "../entities/ISession";
export interface ISessionRepository extends IBaseRepository<ISession, ICreateSession, IUpdateSession> {
    getPendingSessionsOlderThan(days: number): Promise<ISession[]>;
    listUserSessionsPaginated(userId: number, page?: number, perPage?: number): Promise<any[]>;
    sessionExistsForEvent(eventId: number, userId: number): Promise<boolean>;
}
