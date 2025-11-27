export interface CreateSessionDto {
    title?: string;
    description?: string;
    type: "rapid" | "scheduled";
    eventId?: number;
    methodId?: number;
    albumId?: number;
    startTime?: string;
}
export interface UpdateSessionDto {
    title?: string;
    description?: string;
    methodId?: number;
    albumId?: number;
}
export interface SessionResponseDto {
    sessionId: number;
    userId: number;
    title?: string;
    description?: string;
    type: "rapid" | "scheduled";
    status: "pendiente" | "completada";
    eventId?: number;
    methodId?: number;
    albumId?: number;
    elapsedInterval: string;
    elapsedMs: number;
    createdAt: string;
    updatedAt: string;
    lastInteractionAt: string;
}
export interface SessionFilters {
    status?: "pendiente" | "completada";
    type?: "rapid" | "scheduled";
    fromDate?: string;
    toDate?: string;
    page?: number;
    perPage?: number;
}
export interface SessionListResponse {
    sessions: SessionResponseDto[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
