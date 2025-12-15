import { ICreateUser, IUpdateUser, IUser, IUserResponse } from "../entities/IUser";

/**
 * Interfaz para el servicio de usuarios
 * Define el contrato que debe implementar cualquier servicio de gestión de usuarios
 */
export interface IUserService {
  /**
   * Crea un nuevo usuario en el sistema
   * @param userData Datos del usuario a crear
   * @returns Resultado de la operación con el usuario creado o error
   */
  createUser(userData: ICreateUser): Promise<{
    success: boolean;
    user?: IUser;
    message?: string;
    error?: string;
  }>;

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado o error
   */
  getUserById(id: number): Promise<{
    success: boolean;
    user?: IUser;
    error?: string;
  }>;

  /**
   * Obtiene un usuario por su email
   * @param email Email del usuario
   * @returns Usuario encontrado o error
   */
  getUserByEmail(email: string): Promise<{
    success: boolean;
    user?: IUser;
    error?: string;
  }>;

  /**
   * Actualiza la información de un usuario
   * @param id ID del usuario a actualizar
   * @param updateData Datos a actualizar
   * @returns Usuario actualizado o error
   */
  updateUser(id: number, updateData: IUpdateUser): Promise<{
    success: boolean;
    user?: IUser;
    error?: string;
  }>;

  /**
   * Verifica las credenciales de login de un usuario
   * @param identifier Email o nombre de usuario
   * @param password Contraseña en texto plano
   * @returns Usuario autenticado o error
   */
  verifyCredentials(identifier: string, password: string): Promise<{
    success: boolean;
    user?: IUserResponse;
    error?: string;
  }>;

  /**
   * Obtiene todos los usuarios del sistema
   * @returns Lista de usuarios o error
   */
  getAllUsers(): Promise<{
    success: boolean;
    users?: IUser[];
    error?: string;
  }>;

  /**
   * Cambia la contraseña de un usuario
   * @param userId ID del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Resultado de la operación
   */
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  /**
   * Elimina un usuario del sistema
   * @param id ID del usuario a eliminar
   * @returns Resultado de la operación
   */
  deleteUser(id: number): Promise<{
    success: boolean;
    error?: string;
  }>;
}