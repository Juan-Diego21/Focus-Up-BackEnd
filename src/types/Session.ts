/**
 * Tipos y DTOs para la API de sesiones de concentración
 * Define las interfaces para creación, actualización y respuesta de sesiones
 */

// DTO para crear una nueva sesión
export interface CreateSessionDto {
  title?: string;
  description?: string;
  type: "rapid" | "scheduled";
  eventId?: number;
  methodId?: number;
  albumId?: number;
  startTime?: string; // ISO timestamp
}

// DTO para actualizar una sesión existente
export interface UpdateSessionDto {
  title?: string;
  description?: string;
  methodId?: number;
  albumId?: number;
}

// DTO de respuesta para una sesión
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
  elapsedInterval: string; // Formato HH:MM:SS
  elapsedMs: number; // Milisegundos
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastInteractionAt: string; // ISO timestamp
}

// Filtros para listar sesiones
export interface SessionFilters {
  status?: "pendiente" | "completada";
  type?: "rapid" | "scheduled";
  fromDate?: string;
  toDate?: string;
  page?: number;
  perPage?: number;
}

// Respuesta paginada para lista de sesiones
export interface SessionListResponse {
  sessions: SessionResponseDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}