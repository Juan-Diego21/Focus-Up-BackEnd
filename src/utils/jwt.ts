import jwt from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Utilidades para manejo de tokens JWT
 * Proporciona métodos para generar, verificar y extraer tokens de autenticación
 */

// Usar variables de entorno con valores por defecto seguros
const JWT_SECRET =
  process.env.JWT_SECRET ||
  env.JWT_SECRET ||
  "fallback-secret-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  env.JWT_REFRESH_SECRET ||
  "fallback-refresh-secret-change-in-production";
const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN || env.JWT_ACCESS_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || env.JWT_REFRESH_EXPIRES_IN || "7d";

// Lista negra de tokens revocados (en memoria para simplicidad)
// En producción, usar Redis o base de datos para persistencia
const tokenBlacklist = new Set<string>();

/**
 * Servicio de lista negra de tokens
 * Gestiona tokens revocados hasta su expiración natural
 */
export class TokenBlacklistService {
  /**
   * Agrega un token a la lista negra
   * El token se mantiene invalidado hasta su expiración natural
   */
  static addToBlacklist(token: string): void {
    tokenBlacklist.add(token);
  }

  /**
   * Verifica si un token está en la lista negra
   * Retorna true si el token ha sido revocado
   */
  static isBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  /**
   * Limpia tokens expirados de la lista negra
   * Se ejecuta periódicamente para mantener la memoria limpia
   */
  static cleanupExpiredTokens(): void {
    // Nota: En implementación real, verificar expiración de cada token
    // Por simplicidad, esta función está preparada para futura implementación
  }
}

export interface JwtPayload {
  userId: number;
  email: string;
}

/**
 * Clase utilitaria para operaciones JWT
 * Maneja tokens de acceso y refresh con configuración centralizada
 */
export class JwtUtils {
  // Generar access token - CON TIPADO EXPLÍCITO
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(
      payload as object, // Asegurar que sea tipo object
      JWT_SECRET as jwt.Secret, // Asegurar que sea tipo Secret
      {
        expiresIn: JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );
  }

  // Generar refresh token - CON TIPADO EXPLÍCITO
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      payload as object, // Asegurar que sea tipo object
      JWT_REFRESH_SECRET as jwt.Secret, // Asegurar que sea tipo Secret
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );
  }

  // Verificar access token
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
    } catch (error) {
      throw new Error("Token de acceso inválido o expirado");
    }
  }

  // Verificar refresh token
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET as jwt.Secret) as JwtPayload;
    } catch (error) {
      throw new Error("Token de refresco inválido o expirado");
    }
  }

  // Extraer token del header Authorization
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}
