import { Request, Response, NextFunction } from "express";
import { JwtUtils, JwtPayload } from "../utils/jwt";
import { ApiResponse } from "../types/ApiResponse";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = JwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: "Token de acceso requerido",
        timestamp: new Date(),
      };
      return res.status(401).json(response);
    }

    const decoded = JwtUtils.verifyAccessToken(token);
    (req as any).user = decoded; // Adjuntar información del usuario al request
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);

    const response: ApiResponse = {
      success: false,
      message: "Token inválido o expirado",
      timestamp: new Date(),
    };
    res.status(403).json(response);
  }
};

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
      console.warn("Token opcional inválido:", error);
    }
  }

  next();
};
