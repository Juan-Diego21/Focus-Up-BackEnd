import { JwtPayload } from "../../utils/jwt";

/**
 * Interfaz que representa un usuario autenticado
 * Extiende JwtPayload para incluir campos adicionales útiles en la aplicación
 */
export interface IAuthUser extends JwtPayload {
  /** Nombre de usuario (opcional, puede no estar en el token JWT) */
  username?: string;

  /** Rol del usuario (si se implementan roles en el futuro) */
  role?: string;

  /** Timestamp de cuando se emitió el token */
  iat?: number;

  /** Timestamp de expiración del token */
  exp?: number;
}