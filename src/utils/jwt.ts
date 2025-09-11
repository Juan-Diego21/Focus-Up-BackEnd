import jwt from "jsonwebtoken";
import { env } from "../config/env";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "your-refresh-secret-key-change-in-production";

export interface JwtPayload {
  userId: number;
  email: string;
}

export class JwtUtils {
  // Generar access token
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "15m", // Token corto para mayor seguridad
    });
  }

  // Generar refresh token
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "7d", // Token largo para renovación
    });
  }

  // Verificar access token
  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  // Verificar refresh token
  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  }

  // Extraer token del header Authorization
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}
