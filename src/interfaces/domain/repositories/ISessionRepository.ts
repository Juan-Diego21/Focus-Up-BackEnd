import { IBaseRepository } from "./IBaseRepository";
import { ISession, ICreateSession, IUpdateSession } from "../entities/ISession";

/**
 * Interfaz específica para el repositorio de sesiones
 * Extiende la interfaz base con métodos específicos de sesiones
 */
export interface ISessionRepository extends IBaseRepository<ISession, ICreateSession, IUpdateSession> {
  /**
   * Obtiene sesiones pendientes más antiguas que los días especificados
   * @param days Número de días de antigüedad
   * @returns Array de sesiones pendientes antiguas
   */
  getPendingSessionsOlderThan(days: number): Promise<ISession[]>;

  /**
   * Lista sesiones paginadas de un usuario específico
   * @param userId ID del usuario
   * @param page Número de página (default: 1)
   * @param perPage Elementos por página (default: 10)
   * @returns Array de sesiones en formato snake_case
   */
  listUserSessionsPaginated(userId: number, page?: number, perPage?: number): Promise<any[]>;

  /**
   * Verifica si existe una sesión para un evento específico
   * @param eventId ID del evento
   * @param userId ID del usuario
   * @returns true si existe, false si no
   */
  sessionExistsForEvent(eventId: number, userId: number): Promise<boolean>;
}