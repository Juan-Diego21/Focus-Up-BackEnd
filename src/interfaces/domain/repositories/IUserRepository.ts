import { IBaseRepository } from "./IBaseRepository";
import { IUser, ICreateUser, IUpdateUser } from "../entities/IUser";

/**
 * Interfaz específica para el repositorio de usuarios
 * Extiende la interfaz base con métodos específicos de usuario
 */
export interface IUserRepository extends IBaseRepository<IUser, ICreateUser, IUpdateUser> {
  /**
   * Busca un usuario por su email
   * @param email Email del usuario
   * @returns Usuario encontrado o null
   */
  findByEmail(email: string): Promise<IUser | null>;

  /**
   * Busca un usuario por su nombre de usuario
   * @param username Nombre de usuario
   * @returns Usuario encontrado o null
   */
  findByUsername(username: string): Promise<IUser | null>;

  /**
   * Verifica si existe un usuario con el email especificado
   * @param email Email a verificar
   * @param excludeUserId ID de usuario a excluir de la verificación (útil para updates)
   * @returns true si existe, false si no
   */
  emailExists(email: string, excludeUserId?: number): Promise<boolean>;

  /**
   * Verifica si existe un usuario con el nombre de usuario especificado
   * @param username Nombre de usuario a verificar
   * @param excludeUserId ID de usuario a excluir de la verificación (útil para updates)
   * @returns true si existe, false si no
   */
  usernameExists(username: string, excludeUserId?: number): Promise<boolean>;

  /**
   * Actualiza la contraseña de un usuario
   * @param userId ID del usuario
   * @param hashedPassword Nueva contraseña hasheada
   * @returns true si se actualizó correctamente
   */
  updatePassword(userId: number, hashedPassword: string): Promise<boolean>;
}