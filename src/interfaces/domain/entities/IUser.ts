import { User, UserCreateInput, UserUpdateInput } from "../../../types/User";

/**
 * Interfaz que representa un usuario en el dominio
 * Alias para el tipo User existente para mantener compatibilidad
 */
export interface IUser extends User {
  /** ID del objetivo de estudio */
  idObjetivoEstudio?: number;

  /** Versión del token para invalidación de sesiones */
  tokenVersion?: number;
}

/**
 * Alias para tipos existentes para mantener compatibilidad
 */
export type ICreateUser = UserCreateInput;
export type IUpdateUser = UserUpdateInput;

/**
 * Interfaz para respuesta pública de usuario (sin contraseña)
 * Compatible con el tipo User pero sin contraseña
 */
export type IUserResponse = Omit<User, 'contrasena'>;