import { Request, Response, NextFunction } from "express";
import { JwtUtils, JwtPayload, TokenBlacklistService } from "../utils/jwt";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

/**
 * Middleware de autenticación JWT
 * Verifica la presencia, validez y estado de revocación del token de acceso
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    logger.info(`Auth header received: ${authHeader ? 'present' : 'missing'} for ${req.method} ${req.originalUrl}`);

    const token = JwtUtils.extractTokenFromHeader(authHeader);
    logger.info(`Token extracted: ${token ? 'present' : 'missing'}`);

    if (!token) {
      logger.warn(`Acceso no autorizado - Token faltante: ${req.method} ${req.originalUrl} desde ${req.ip}`);
      const response: ApiResponse = {
        success: false,
        message: "Acceso no autorizado. Token requerido.",
        timestamp: new Date(),
      };
      return res.status(401).json(response);
    }

    // Verificar si el token está en la lista negra (revocado por logout)
    // Esto asegura que los tokens revocados sean rechazados inmediatamente
    if (TokenBlacklistService.isBlacklisted(token)) {
      logger.warn(`Acceso no autorizado - Token revocado: ${req.method} ${req.originalUrl} desde ${req.ip}`);
      const response: ApiResponse = {
        success: false,
        message: "Acceso no autorizado. Sesión expirada o cerrada.",
        timestamp: new Date(),
      };
      return res.status(401).json(response);
    }

    const decoded = JwtUtils.verifyAccessToken(token);
    logger.info(`Token decoded successfully for userId: ${decoded.userId}, email: ${decoded.email}`);
    (req as any).user = decoded; // Adjuntar información del usuario al request
    next();
  } catch (error: any) {
    let reason = "desconocido";
    let statusCode = 401;

    if (error.name === "TokenExpiredError") {
      reason = "expirado";
      statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      reason = "malformado";
      statusCode = 401;
    } else if (error.name === "NotBeforeError") {
      reason = "no válido aún";
      statusCode = 401;
    } else {
      statusCode = 403;
    }

    logger.warn(`Acceso no autorizado - Token ${reason}: ${req.method} ${req.originalUrl} desde ${req.ip} - Error: ${error.message}`);

    const response: ApiResponse = {
      success: false,
      message: "Acceso no autorizado. Token inválido o expirado.",
      timestamp: new Date(),
    };
    res.status(statusCode).json(response);
  }
};

/**
 * Middleware de autenticación opcional
 * Intenta autenticar al usuario si hay un token presente, pero no falla si no lo hay
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = JwtUtils.extractTokenFromHeader(authHeader);

  if (token) {
    try {
      const decoded = JwtUtils.verifyAccessToken(token);
      (req as any).user = decoded;
    } catch (error) {
      // Si el token es inválido, continuamos sin autenticación
      logger.warn("Token opcional inválido:", error);
    }
  }

  next();
};
