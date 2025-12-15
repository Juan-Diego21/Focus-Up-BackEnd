import { CreateSessionDto, UpdateSessionDto, SessionResponseDto, SessionFilters, SessionListResponse } from "../../../types/Session";
export interface ISessionService {
    createSession(dto: CreateSessionDto, userId: number): Promise<SessionResponseDto>;
    getSession(sessionId: number, userId: number): Promise<SessionResponseDto>;
    listSessions(filters: SessionFilters, userId: number): Promise<SessionListResponse>;
    updateSession(sessionId: number, dto: UpdateSessionDto, userId: number): Promise<SessionResponseDto>;
    getPendingSessionsOlderThan(days: number): Promise<any[]>;
    listUserSessionsPaginated(userId: number, page?: number, perPage?: number): Promise<any[]>;
    createSessionFromEvent(eventId: number, userId: number): Promise<SessionResponseDto>;
}
