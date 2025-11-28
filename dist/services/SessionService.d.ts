import { SesionConcentracionEntity } from "../models/SesionConcentracion.entity";
import { CreateSessionDto, UpdateSessionDto, SessionResponseDto, SessionFilters, SessionListResponse } from "../types/Session";
export declare class SessionService {
    private sessionRepository;
    private userRepository;
    private eventoRepository;
    private metodoRepository;
    private albumRepository;
    private metodoRealizadoRepository;
    private intervalToMs;
    private msToInterval;
    private entityToDto;
    private validateUserExists;
    private validateEventExists;
    private validateMethodExists;
    private validateAlbumExists;
    createSession(dto: CreateSessionDto, userId: number): Promise<SessionResponseDto>;
    getSession(sessionId: number, userId: number): Promise<SessionResponseDto>;
    listSessions(filters: SessionFilters, userId: number): Promise<SessionListResponse>;
    updateSession(sessionId: number, dto: UpdateSessionDto, userId: number): Promise<SessionResponseDto>;
    getPendingSessionsOlderThan(days: number): Promise<SesionConcentracionEntity[]>;
    listUserSessionsPaginated(userId: number, page?: number, perPage?: number): Promise<any[]>;
    createSessionFromEvent(eventId: number, userId: number): Promise<SessionResponseDto>;
}
