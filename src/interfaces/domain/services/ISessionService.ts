import { CreateSessionDto, UpdateSessionDto, SessionResponseDto, SessionFilters, SessionListResponse } from "../../../types/Session";

/**
 * Interfaz para el servicio de sesiones
 * Define el contrato que debe implementar cualquier servicio de gestión de sesiones
 */
export interface ISessionService {
  /**
   * Crea una nueva sesión de concentración
   * @param dto Datos para crear la sesión
   * @param userId ID del usuario autenticado
   * @returns Sesión creada en formato de respuesta
   */
  createSession(dto: CreateSessionDto, userId: number): Promise<SessionResponseDto>;

  /**
   * Obtiene una sesión específica por ID
   * @param sessionId ID de la sesión
   * @param userId ID del usuario (para verificar propiedad)
   * @returns Sesión encontrada
   * @throws Error si no se encuentra o no pertenece al usuario
   */
  getSession(sessionId: number, userId: number): Promise<SessionResponseDto>;

  /**
   * Lista sesiones del usuario con filtros y paginación
   * @param filters Filtros y opciones de paginación
   * @param userId ID del usuario
   * @returns Lista paginada de sesiones
   */
  listSessions(filters: SessionFilters, userId: number): Promise<SessionListResponse>;

  /**
   * Actualiza una sesión existente
   * @param sessionId ID de la sesión a actualizar
   * @param dto Datos de actualización
   * @param userId ID del usuario
   * @returns Sesión actualizada
   * @throws Error si no se encuentra o no pertenece al usuario
   */
  updateSession(sessionId: number, dto: UpdateSessionDto, userId: number): Promise<SessionResponseDto>;

  /**
   * Obtiene sesiones pendientes más antiguas que los días especificados
   * @param days Número de días de antigüedad
   * @returns Array de sesiones pendientes antiguas
   */
  getPendingSessionsOlderThan(days: number): Promise<any[]>;

  /**
   * Lista sesiones paginadas de un usuario (formato snake_case)
   * @param userId ID del usuario
   * @param page Número de página
   * @param perPage Elementos por página
   * @returns Array de sesiones en formato snake_case
   */
  listUserSessionsPaginated(userId: number, page?: number, perPage?: number): Promise<any[]>;

  /**
   * Crea una sesión desde un evento existente
   * @param eventId ID del evento
   * @param userId ID del usuario
   * @returns Sesión creada
   * @throws Error si el evento no existe, no pertenece al usuario, etc.
   */
  createSessionFromEvent(eventId: number, userId: number): Promise<SessionResponseDto>;
}