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
  static addToBlacklist(token: string): void {
    tokenBlacklist.add(token);
  }

  static isBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  static cleanupExpiredTokens(): void {
    // Nota: En implementación real, verificar expiración de cada token
  }
}

export interface JwtPayload {
  userId: number;
  email: string;
  tokenVersion: number;
}

/**
 * Clase utilitaria para operaciones JWT
 * Maneja tokens de acceso y refresh con configuración centralizada
 */
export class JwtUtils {
  static generateAccessToken(payload: JwtPayload): string {
    const token = jwt.sign(
      payload as object,
      JWT_SECRET as jwt.Secret,
      {
        expiresIn: JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );

    try {
      const decoded = jwt.decode(token) as any;
      console.log('🔐 JWT Token generado:');
      console.log('  📅 Creación:', new Date(decoded.iat * 1000).toISOString());
      console.log('  ⏰ Expira a:', new Date(decoded.exp * 1000).toISOString());
      console.log('  ⏳ Expira en:', JWT_ACCESS_EXPIRES_IN);
      console.log('  👤 ID usuario:', payload.userId);
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
    }

    return token;
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      payload as object,
      JWT_REFRESH_SECRET as jwt.Secret,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      }
    );
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
    } catch (error) {
      console.error("❌ Error verifying access token:", error);
      throw new Error("Token de acceso inválido o expirado");
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET as jwt.Secret) as JwtPayload;
    } catch (error) {
      console.error("❌ Error verifying refresh token:", error);
      throw new Error("Token de refresco inválido o expirado");
    }
  }


  /*Cambios realizados*/
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    return authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    }
}