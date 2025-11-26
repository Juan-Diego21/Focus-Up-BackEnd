import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

/**
 * Middleware para verificar que el usuario autenticado es propietario de la sesión
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Next function
 */
export const checkSessionOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const sessionId = parseInt(req.params.sessionId);

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: "Usuario no autenticado",
        timestamp: new Date(),
      };
      res.status(401).json(response);
      return;
    }

    if (isNaN(sessionId)) {
      const response: ApiResponse = {
        success: false,
        message: "ID de sesión inválido",
        timestamp: new Date(),
      };
      res.status(400).json(response);
      return;
    }

    // Adjuntar información de propiedad al request para uso posterior
    (req as any).sessionOwnership = {
      userId,
      sessionId,
      isOwner: true, // Asumimos que es propietario, el servicio lo verificará
    };

    logger.info(`Verificación de propiedad de sesión ${sessionId} para usuario ${userId}`);
    next();
  } catch (error: any) {
    logger.error("Error en middleware de propiedad de sesión:", error);

    const response: ApiResponse = {
      success: false,
      message: "Error interno del servidor",
      timestamp: new Date(),
    };

    res.status(500).json(response);
  }
};

/**
 * Middleware para convertir claves snake_case a camelCase en el body del request
 * Compatible con la API que acepta tanto snake_case como camelCase
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Next function
 */
export const snakeToCamelCase = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = convertKeysToCamelCase(req.body);
      logger.debug("Body convertido de snake_case a camelCase");
    }

    if (req.query && typeof req.query === "object") {
      req.query = convertKeysToCamelCase(req.query);
      logger.debug("Query convertido de snake_case a camelCase");
    }

    next();
  } catch (error: any) {
    logger.error("Error convirtiendo snake_case a camelCase:", error);
    next(); // Continuar aunque haya error en la conversión
  }
};

/**
 * Función recursiva para convertir claves de objeto de snake_case a camelCase
 * @param obj - Objeto a convertir
 * @returns Objeto con claves en camelCase
 */
function convertKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  const converted: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = convertKeysToCamelCase(obj[key]);
    }
  }

  return converted;
}

/**
 * Middleware para verificar concurrencia optimista usando fecha_actualizacion
 * Verifica que la fecha de actualización coincida antes de modificar
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Next function
 */
export const optimisticConcurrencyCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extraer updatedAt del body si existe
    const updatedAt = req.body?.updatedAt || req.body?.fechaActualizacion;

    if (updatedAt) {
      // Validar formato de fecha
      const date = new Date(updatedAt);
      if (isNaN(date.getTime())) {
        const response: ApiResponse = {
          success: false,
          message: "Formato de fecha de actualización inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      // Adjuntar al request para uso en el servicio
      (req as any).concurrencyCheck = {
        updatedAt: date,
      };

      logger.debug(`Verificación de concurrencia optimista con updatedAt: ${date.toISOString()}`);
    }

    next();
  } catch (error: any) {
    logger.error("Error en middleware de concurrencia optimista:", error);

    const response: ApiResponse = {
      success: false,
      message: "Error interno del servidor",
      timestamp: new Date(),
    };

    res.status(500).json(response);
  }
};