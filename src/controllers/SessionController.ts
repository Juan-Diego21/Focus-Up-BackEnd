import { Request, Response } from "express";
import { SessionService } from "../services/SessionService";
import { NotificationService } from "../services/NotificationService";
import { CreateSessionDto, UpdateSessionDto, SessionFilters } from "../types/Session";
import { IApiResponse } from "../interfaces/shared/IApiResponse";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de sesiones de concentración
 * Maneja todas las operaciones CRUD y control de temporizadores
 */
export class SessionController {
  private sessionService = new SessionService();
  private notificationService = new NotificationService();

  /**
   * Crea una nueva sesión de concentración
   * POST /api/v1/sessions
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto: CreateSessionDto = req.body;

      logger.info(`Creando sesión para usuario ${userId}`, { dto });

      // Validar campos requeridos
      if (!dto.type || !["rapid", "scheduled"].includes(dto.type)) {
        const response: IApiResponse = {
          success: false,
          message: "Tipo de sesión inválido. Debe ser 'rapid' o 'scheduled'",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      const session = await this.sessionService.createSession(dto, userId);

      const response: IApiResponse = {
        success: true,
        message: "Sesión creada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error("Error creando sesión:", error);

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtiene una sesión específica
   * GET /api/v1/sessions/:sessionId
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: IApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      const session = await this.sessionService.getSession(sessionId, userId);

      const response: IApiResponse = {
        success: true,
        message: "Sesión obtenida exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error obteniendo sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      }

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

 /**
  * Lista sesiones del usuario
  * GET /api/v1/users/:userId/sessions
  */
  async listUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const tokenUserId = req.user!.userId;
      const requestedUserId = parseInt(req.params.userId);

      // Verificar que el usuario autenticado es el propietario
      if (tokenUserId !== requestedUserId) {
        const response: IApiResponse = {
          success: false,
          message: "No tienes permisos para ver las sesiones de este usuario",
          timestamp: new Date(),
        };
        res.status(403).json(response);
        return;
      }

      // Solo paginación básica, sin filtros
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 10;

      // Validar parámetros de paginación
      if (page < 1 || perPage < 1 || perPage > 100) {
        const response: IApiResponse = {
          success: false,
          message: "Parámetros de paginación inválidos",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.sessionService.listUserSessionsPaginated(requestedUserId, page, perPage);

      const response: IApiResponse = {
        success: true,
        message: "Sesiones obtenidas exitosamente",
        data: result,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error listando sesiones para usuario ${req.params.userId}:`, error);

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Actualiza una sesión existente
   * PATCH /api/v1/sessions/:sessionId
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const sessionId = parseInt(req.params.sessionId);
      const dto: UpdateSessionDto = req.body;

      if (isNaN(sessionId)) {
        const response: IApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Actualizando sesión ${sessionId} para usuario ${userId}`, { dto });

      const session = await this.sessionService.updateSession(sessionId, dto, userId);

      const response: IApiResponse = {
        success: true,
        message: "Sesión actualizada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error actualizando sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      }

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }



  /**
   * Obtiene sesiones pendientes más antiguas que los días especificados
   * GET /api/v1/sessions/pending/aged
   * Endpoint para uso del cron job
   */
  async getPendingAgedSessions(req: Request, res: Response): Promise<void> {
    try {
      // Este endpoint requiere autenticación especial para cron
      // Por ahora permitimos cualquier usuario autenticado
      const days = req.query.days ? parseInt(req.query.days as string) : 7;

      if (isNaN(days) || days <= 0) {
        const response: IApiResponse = {
          success: false,
          message: "Parámetro 'days' inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Obteniendo sesiones pendientes más antiguas que ${days} días`);

      const sessions = await this.sessionService.getPendingSessionsOlderThan(days);

      const response: IApiResponse = {
        success: true,
        message: "Sesiones pendientes obtenidas exitosamente",
        data: sessions,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Error obteniendo sesiones pendientes antiguas:", error);

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Crea una sesión de concentración desde un evento
   * GET /api/v1/sessions/from-event/:eventId
   */
  async createSessionFromEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const eventId = parseInt(req.params.eventId);

      if (isNaN(eventId)) {
        const response: IApiResponse = {
          success: false,
          message: "ID de evento inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Creando sesión desde evento ${eventId} para usuario ${userId}`);

      const session = await this.sessionService.createSessionFromEvent(eventId, userId);

      const response: IApiResponse = {
        success: true,
        message: "Sesión creada exitosamente desde el evento",
        data: session,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error(`Error creando sesión desde evento ${req.params.eventId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrado")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      } else if (error.message.includes("tipo concentración") || error.message.includes("ya existe")) {
        statusCode = 400;
      }

      const response: IApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

}