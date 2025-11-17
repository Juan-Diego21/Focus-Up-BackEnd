import { Request, Response } from "express";
import { reportsService } from "../services/ReportsService";
import { ApiResponse } from "../types/ApiResponse";
import { JwtPayload } from "../utils/jwt";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de reportes de métodos de estudio y sesiones de concentración
 * Maneja operaciones CRUD para reportes con autenticación requerida
 */
export class ReportsController {

  /**
   * Registra un método de estudio como activo para el usuario actual
   * POST /api/v1/reports/active-methods
   */
  async createActiveMethod(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;
      const { id_metodo, estado, progreso } = req.body;

      // Validate id_metodo
      const metodoId = Number(id_metodo);
      if (!id_metodo || isNaN(metodoId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID del método es requerido y debe ser un número",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await reportsService.createActiveMethod({
        idMetodo: metodoId,
        estado: estado || "en_progreso",
        progreso: progreso || 0,
        idUsuario: userPayload.userId,
      });

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al crear método activo",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      // Transform the response to include snake_case field names as expected by frontend
      const metodoData = result.metodoRealizado;
      if (!metodoData) {
        const response: ApiResponse = {
          success: false,
          message: "Error interno: no se pudo obtener el método creado",
          timestamp: new Date(),
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: result.message || "Método activo creado exitosamente",
        data: {
          id_metodo_realizado: metodoData.idMetodoRealizado,
          id_usuario: metodoData.idUsuario,
          id_metodo: metodoData.idMetodo,
          progreso: metodoData.progreso,
          estado: metodoData.estado,
          fecha_inicio: metodoData.fechaInicio,
          fecha_fin: metodoData.fechaFin,
          fecha_creacion: metodoData.fechaCreacion,
          fecha_actualizacion: metodoData.fechaActualizacion,
        },
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error("Error en ReportsController.createActiveMethod:", JSON.stringify(error));

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene todos los reportes del usuario especificado o del usuario actual
   * GET /api/v1/reports?userId=123
   */
  async getUserReports(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;
      const { userId: queryUserId } = req.query;

      // Use provided userId or fallback to authenticated user's ID
      const targetUserId = queryUserId ? parseInt(queryUserId as string) : userPayload.userId;

      if (isNaN(targetUserId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de usuario inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await reportsService.getUserReports(targetUserId);

      if (!result.success) {
        // Check if it's a "user not found" error
        if (result.error === "Usuario no encontrado") {
          const response: ApiResponse = {
            success: false,
            message: "Usuario no encontrado",
            error: result.error,
            timestamp: new Date(),
          };
          return res.status(404).json(response);
        }

        // Other errors
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener reportes",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: result.reports!.combined.length > 0 ? "User reports fetched successfully" : "No reports found for this user",
        data: result.reports!.combined,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en ReportsController.getUserReports:", JSON.stringify(error));

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Actualiza el progreso de un método de estudio
   * PATCH /api/v1/reports/methods/:id/progress
   */
  async updateMethodProgress(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;
      const methodId = parseInt(req.params.id);
      const { progreso, finalizar } = req.body;

      if (isNaN(methodId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID del método inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      // Validar que al menos un campo de actualización esté presente
      if (progreso === undefined && finalizar === undefined) {
        const response: ApiResponse = {
          success: false,
          message: "Debe proporcionar al menos un campo para actualizar (progreso o finalizar)",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await reportsService.updateMethodProgress(methodId, userPayload.userId, {
        progreso,
        finalizar,
      });

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al actualizar progreso del método",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: result.message || "Progreso del método actualizado exitosamente",
        data: result.metodoRealizado,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en ReportsController.updateMethodProgress:", JSON.stringify(error));

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Actualiza el progreso de una sesión de concentración
   * PATCH /api/v1/reports/sessions/:id/progress
   */
  async updateSessionProgress(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;
      const sessionId = parseInt(req.params.id);
      const { estado } = req.body;

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de la sesión inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      // Validar que al menos un campo de actualización esté presente
      if (estado === undefined) {
        const response: ApiResponse = {
          success: false,
          message: "Debe proporcionar al menos un campo para actualizar (estado)",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await reportsService.updateSessionProgress(sessionId, userPayload.userId, {
        estado,
      });

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al actualizar progreso de la sesión",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: result.message || "Progreso de la sesión actualizado exitosamente",
        data: result.sesionRealizada,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en ReportsController.updateSessionProgress:", JSON.stringify(error));

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Elimina un reporte por ID
   * DELETE /api/v1/reports/:id
   */
  async deleteReport(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;
      const reportId = parseInt(req.params.id);

      if (isNaN(reportId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID del reporte inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await reportsService.deleteReport(reportId, userPayload.userId);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al eliminar reporte",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: result.message || "Reporte eliminado correctamente",
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en ReportsController.deleteReport:", JSON.stringify(error));

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }
}

export const reportsController = new ReportsController();