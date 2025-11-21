import { Request, Response } from "express";
import { SessionService } from "../services/SessionService";
import { NotificationService } from "../services/NotificationService";
import { CreateSessionDto, UpdateSessionDto, SessionFilters } from "../types/Session";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de sesiones de concentración
 * Maneja todas las operaciones CRUD y control de temporizadores
 *
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: Endpoints de gestión de sesiones de concentración
 */
export class SessionController {
  private sessionService = new SessionService();
  private notificationService = new NotificationService();

  /**
   * Crea una nueva sesión de concentración
   * POST /api/v1/sessions
   *
   * @swagger
   * /sessions:
   *   post:
   *     summary: Crear nueva sesión de concentración
   *     description: |
   *       Crea una nueva sesión de concentración para el usuario autenticado.
   *
   *       **Características importantes:**
   *       - El tipo de sesión debe ser 'rapid' o 'scheduled'
   *       - Los campos opcionales incluyen título, descripción, evento, método y álbum
   *       - La API acepta tanto snake_case como camelCase en el request body
   *       - Se validan las relaciones opcionales (evento, método, álbum)
   *       - El tiempo transcurrido se inicializa en "00:00:00"
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateSessionDto'
   *           examples:
   *             rapid-session:
   *               summary: Sesión rápida
   *               value:
   *                 title: "Sesión de estudio matutina"
   *                 description: "Enfoque en matemáticas capítulo 5"
   *                 type: "rapid"
   *                 methodId: 456
   *                 albumId: 789
   *             scheduled-session:
   *               summary: Sesión programada con evento
   *               value:
   *                 title: "Preparación para examen"
   *                 description: "Repaso completo de conceptos"
   *                 type: "scheduled"
   *                 eventId: 123
   *                 methodId: 456
   *             minimal-session:
   *               summary: Sesión mínima
   *               value:
   *                 type: "rapid"
   *             snake-case-example:
   *               summary: Ejemplo con snake_case (aceptado)
   *               value:
   *                 title: "Sesión con snake_case"
   *                 type: "rapid"
   *                 event_id: 123
   *                 method_id: 456
   *                 album_id: 789
   *     responses:
   *       201:
   *         description: Sesión creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión creada exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión de estudio matutina"
   *                 description: "Enfoque en matemáticas capítulo 5"
   *                 type: "rapid"
   *                 status: "pending"
   *                 methodId: 456
   *                 albumId: 789
   *                 elapsedInterval: "00:00:00"
   *                 elapsedMs: 0
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T08:30:00.000Z"
   *                 lastInteractionAt: "2024-01-15T08:30:00.000Z"
   *               timestamp: "2024-01-15T08:30:00.000Z"
   *       400:
   *         description: Datos inválidos o tipo de sesión incorrecto
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               invalid-type:
   *                 value:
   *                   success: false
   *                   message: "Tipo de sesión inválido. Debe ser 'rapid' o 'scheduled'"
   *                   timestamp: "2024-01-15T08:30:00.000Z"
   *               invalid-event:
   *                 value:
   *                   success: false
   *                   message: "Evento no encontrado o no pertenece al usuario"
   *                   timestamp: "2024-01-15T08:30:00.000Z"
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const dto: CreateSessionDto = req.body;

      logger.info(`Creando sesión para usuario ${userId}`, { dto });

      // Validar campos requeridos
      if (!dto.type || !["rapid", "scheduled"].includes(dto.type)) {
        const response: ApiResponse = {
          success: false,
          message: "Tipo de sesión inválido. Debe ser 'rapid' o 'scheduled'",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      const session = await this.sessionService.createSession(dto, userId);

      const response: ApiResponse = {
        success: true,
        message: "Sesión creada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error("Error creando sesión:", error);

      const response: ApiResponse = {
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
   *
   * @swagger
   * /sessions/{sessionId}:
   *   get:
   *     summary: Obtener detalles de una sesión específica
   *     description: |
   *       Obtiene los detalles completos de una sesión de concentración específica.
   *
   *       **Validaciones:**
   *       - El usuario debe estar autenticado
   *       - La sesión debe existir
   *       - La sesión debe pertenecer al usuario autenticado
   *       - Retorna tiempo transcurrido en ambos formatos (intervalo y ms)
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión
   *         example: 1
   *     responses:
   *       200:
   *         description: Sesión obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión obtenida exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión de estudio matutina"
   *                 description: "Enfoque en matemáticas capítulo 5"
   *                 type: "rapid"
   *                 status: "pending"
   *                 methodId: 456
   *                 albumId: 789
   *                 elapsedInterval: "01:30:45"
   *                 elapsedMs: 5445000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T09:15:30.000Z"
   *                 lastInteractionAt: "2024-01-15T09:15:30.000Z"
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       400:
   *         description: ID de sesión inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "ID de sesión inválido"
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "Sesión no encontrada o no pertenece al usuario"
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "Sesión no encontrada o no pertenece al usuario"
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      const session = await this.sessionService.getSession(sessionId, userId);

      const response: ApiResponse = {
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

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Lista sesiones del usuario con filtros
   * GET /api/v1/users/:userId/sessions
   *
   * @swagger
   * /users/{userId}/sessions:
   *   get:
   *     summary: Listar sesiones de un usuario con filtros opcionales
   *     description: |
   *       Obtiene una lista paginada de sesiones de concentración para un usuario específico.
   *
   *       **Filtros disponibles:**
   *       - `status`: Filtrar por estado ('pending' o 'completed')
   *       - `type`: Filtrar por tipo ('rapid' o 'scheduled')
   *       - `fromDate`: Fecha inicial (YYYY-MM-DD)
   *       - `toDate`: Fecha final (YYYY-MM-DD)
   *       - `page`: Número de página (default: 1)
   *       - `perPage`: Elementos por página (default: 10)
   *
   *       **Paginación:**
   *       - Máximo 100 elementos por página
   *       - Ordenado por fecha de creación descendente
   *       - Solo el propietario puede ver sus sesiones
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario propietario de las sesiones
   *         example: 123
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, completed]
   *         description: Filtrar por estado de la sesión
   *         example: pending
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [rapid, scheduled]
   *         description: Filtrar por tipo de sesión
   *         example: rapid
   *       - in: query
   *         name: fromDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha inicial para filtrar (YYYY-MM-DD)
   *         example: "2024-01-01"
   *       - in: query
   *         name: toDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha final para filtrar (YYYY-MM-DD)
   *         example: "2024-01-31"
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número de página
   *         example: 1
   *       - in: query
   *         name: perPage
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Elementos por página
   *         example: 10
   *     responses:
   *       200:
   *         description: Sesiones obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionListResponse'
   *             example:
   *               success: true
   *               message: "Sesiones obtenidas exitosamente"
   *               data:
   *                 sessions:
   *                   - sessionId: 1
   *                     userId: 123
   *                     title: "Sesión matutina"
   *                     type: "rapid"
   *                     status: "pending"
   *                     elapsedInterval: "01:30:45"
   *                     elapsedMs: 5445000
   *                     createdAt: "2024-01-15T08:30:00.000Z"
   *                     updatedAt: "2024-01-15T09:15:30.000Z"
   *                     lastInteractionAt: "2024-01-15T09:15:30.000Z"
   *                   - sessionId: 2
   *                     userId: 123
   *                     title: "Preparación examen"
   *                     type: "scheduled"
   *                     status: "completed"
   *                     elapsedInterval: "02:15:30"
   *                     elapsedMs: 8130000
   *                     createdAt: "2024-01-14T10:00:00.000Z"
   *                     updatedAt: "2024-01-14T12:15:30.000Z"
   *                     lastInteractionAt: "2024-01-14T12:15:30.000Z"
   *                 total: 25
   *                 page: 1
   *                 perPage: 10
   *                 totalPages: 3
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       403:
   *         description: Usuario no autorizado para ver las sesiones
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "No tienes permisos para ver las sesiones de este usuario"
   *               timestamp: "2024-01-15T09:15:30.000Z"
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async listUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const tokenUserId = (req as any).user.userId;
      const requestedUserId = parseInt(req.params.userId);

      // Verificar que el usuario autenticado es el propietario
      if (tokenUserId !== requestedUserId) {
        const response: ApiResponse = {
          success: false,
          message: "No tienes permisos para ver las sesiones de este usuario",
          timestamp: new Date(),
        };
        res.status(403).json(response);
        return;
      }

      const filters: SessionFilters = {
        status: req.query.status as "pending" | "completed",
        type: req.query.type as "rapid" | "scheduled",
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        perPage: req.query.perPage ? parseInt(req.query.perPage as string) : undefined,
      };

      const result = await this.sessionService.listSessions(filters, requestedUserId);

      const response: ApiResponse = {
        success: true,
        message: "Sesiones obtenidas exitosamente",
        data: result,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error listando sesiones para usuario ${req.params.userId}:`, error);

      const response: ApiResponse = {
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
   *
   * @swagger
   * /sessions/{sessionId}:
   *   patch:
   *     summary: Actualizar metadatos de una sesión
   *     description: |
   *       Actualiza los metadatos de una sesión de concentración existente.
   *
   *       **Campos actualizables:**
   *       - `title`: Título de la sesión
   *       - `description`: Descripción de la sesión
   *       - `methodId`: ID del método de estudio asociado
   *       - `albumId`: ID del álbum de música asociado
   *
   *       **Restricciones:**
   *       - Solo el propietario puede actualizar la sesión
   *       - No se puede cambiar el tipo, estado o tiempo transcurrido
   *       - Las relaciones opcionales se validan antes de actualizar
   *       - Usa concurrencia optimista con updatedAt
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión a actualizar
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateSessionDto'
   *           examples:
   *             update-title-description:
   *               summary: Actualizar título y descripción
   *               value:
   *                 title: "Sesión actualizada"
   *                 description: "Nueva descripción de la sesión"
   *             update-relations:
   *               summary: Actualizar relaciones
   *               value:
   *                 methodId: 457
   *                 albumId: 790
   *             partial-update:
   *               summary: Actualización parcial
   *               value:
   *                 title: "Nuevo título"
   *     responses:
   *       200:
   *         description: Sesión actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión actualizada exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión actualizada"
   *                 description: "Nueva descripción de la sesión"
   *                 type: "rapid"
   *                 status: "pending"
   *                 methodId: 457
   *                 albumId: 790
   *                 elapsedInterval: "01:30:45"
   *                 elapsedMs: 5445000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:45:30.000Z"
   *                 lastInteractionAt: "2024-01-15T09:15:30.000Z"
   *               timestamp: "2024-01-15T10:45:30.000Z"
   *       400:
   *         description: Datos inválidos o ID de sesión incorrecto
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       409:
   *         description: Conflicto de concurrencia (datos modificados por otro proceso)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "Los datos han sido modificados por otro proceso"
   *               timestamp: "2024-01-15T10:45:30.000Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);
      const dto: UpdateSessionDto = req.body;

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Actualizando sesión ${sessionId} para usuario ${userId}`, { dto });

      const session = await this.sessionService.updateSession(sessionId, dto, userId);

      const response: ApiResponse = {
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

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Pausa una sesión de concentración
   * POST /api/v1/sessions/:sessionId/pause
   *
   * @swagger
   * /sessions/{sessionId}/pause:
   *   post:
   *     summary: Pausar el temporizador de una sesión
   *     description: |
   *       Pausa el temporizador de una sesión de concentración y acumula el tiempo transcurrido.
   *
   *       **Comportamiento:**
   *       - Calcula el tiempo adicional transcurrido desde la última interacción
   *       - Actualiza el tiempo total transcurrido en la sesión
   *       - Actualiza la última interacción al momento actual
   *       - Es idempotente: si ya está pausada, devuelve el estado actual
   *       - Solo funciona con sesiones pendientes (no completadas)
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión a pausar
   *         example: 1
   *     responses:
   *       200:
   *         description: Sesión pausada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión pausada exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión de estudio"
   *                 type: "rapid"
   *                 status: "pending"
   *                 elapsedInterval: "01:45:30"
   *                 elapsedMs: 6330000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:15:30.000Z"
   *                 lastInteractionAt: "2024-01-15T10:15:30.000Z"
   *               timestamp: "2024-01-15T10:15:30.000Z"
   *       400:
   *         description: ID de sesión inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async pauseSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Pausando sesión ${sessionId} para usuario ${userId}`);

      const session = await this.sessionService.pauseSession(sessionId, userId);

      const response: ApiResponse = {
        success: true,
        message: "Sesión pausada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error pausando sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      }

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Reanuda una sesión de concentración
   * POST /api/v1/sessions/:sessionId/resume
   *
   * @swagger
   * /sessions/{sessionId}/resume:
   *   post:
   *     summary: Reanudar el temporizador de una sesión
   *     description: |
   *       Reanuda el temporizador de una sesión de concentración pausada.
   *
   *       **Comportamiento:**
   *       - Actualiza la última interacción al momento actual
   *       - El temporizador comienza a contar desde este momento
   *       - Es idempotente: si ya está corriendo, actualiza la última interacción
   *       - Solo funciona con sesiones pendientes (no completadas)
   *       - No acumula tiempo adicional hasta el próximo pause o complete
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión a reanudar
   *         example: 1
   *     responses:
   *       200:
   *         description: Sesión reanudada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión reanudada exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión de estudio"
   *                 type: "rapid"
   *                 status: "pending"
   *                 elapsedInterval: "01:30:45"
   *                 elapsedMs: 5445000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:16:00.000Z"
   *                 lastInteractionAt: "2024-01-15T10:16:00.000Z"
   *               timestamp: "2024-01-15T10:16:00.000Z"
   *       400:
   *         description: ID de sesión inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async resumeSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Reanudando sesión ${sessionId} para usuario ${userId}`);

      const session = await this.sessionService.resumeSession(sessionId, userId);

      const response: ApiResponse = {
        success: true,
        message: "Sesión reanudada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error reanudando sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      }

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Completa una sesión de concentración
   * POST /api/v1/sessions/:sessionId/complete
   *
   * @swagger
   * /sessions/{sessionId}/complete:
   *   post:
   *     summary: Completar una sesión de concentración
   *     description: |
   *       Marca una sesión de concentración como completada y calcula el tiempo final transcurrido.
   *
   *       **Validaciones importantes:**
   *       - Si hay un método asociado, debe estar completado primero
   *       - Calcula el tiempo final transcurrido hasta el momento de completar
   *       - Cambia el estado a 'completada' (no se puede modificar después)
   *       - Es idempotente: si ya está completada, devuelve el estado actual
   *
   *       **Bloqueo de método:**
   *       - Si la sesión tiene un método asociado que no está completado, se bloquea la finalización
   *       - Esto asegura que los usuarios completen sus métodos antes de finalizar sesiones
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión a completar
   *         example: 1
   *     responses:
   *       200:
   *         description: Sesión completada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión completada exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión completada"
   *                 type: "rapid"
   *                 status: "completed"
   *                 methodId: 456
   *                 elapsedInterval: "02:15:30"
   *                 elapsedMs: 8130000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:45:30.000Z"
   *                 lastInteractionAt: "2024-01-15T10:45:30.000Z"
   *               timestamp: "2024-01-15T10:45:30.000Z"
   *       400:
   *         description: Método asociado no completado o ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               method-not-completed:
   *                 value:
   *                   success: false
   *                   message: "No se puede completar la sesión: el método asociado no está completado"
   *                   timestamp: "2024-01-15T10:45:30.000Z"
   *               invalid-id:
   *                 value:
   *                   success: false
   *                   message: "ID de sesión inválido"
   *                   timestamp: "2024-01-15T10:45:30.000Z"
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async completeSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Completando sesión ${sessionId} para usuario ${userId}`);

      const session = await this.sessionService.completeSession(sessionId, userId);

      const response: ApiResponse = {
        success: true,
        message: "Sesión completada exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error completando sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      } else if (error.message.includes("método")) {
        statusCode = 400;
      }

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Finaliza una sesión más tarde
   * POST /api/v1/sessions/:sessionId/finish-later
   *
   * @swagger
   * /sessions/{sessionId}/finish-later:
   *   post:
   *     summary: Finalizar una sesión más tarde
   *     description: |
   *       Pausa una sesión y la mantiene pendiente para continuar después.
   *
   *       **Comportamiento:**
   *       - Acumula el tiempo transcurrido hasta el momento
   *       - Mantiene el estado como 'pendiente' (no completada)
   *       - Actualiza la última interacción al momento actual
   *       - Es idempotente: si ya está pausada, acumula tiempo adicional
   *       - Útil para sesiones que se reanudan en diferentes momentos
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión a finalizar más tarde
   *         example: 1
   *     responses:
   *       200:
   *         description: Sesión finalizada más tarde exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/SessionResponseDto'
   *             example:
   *               success: true
   *               message: "Sesión finalizada más tarde exitosamente"
   *               data:
   *                 sessionId: 1
   *                 userId: 123
   *                 title: "Sesión pausada"
   *                 type: "rapid"
   *                 status: "pending"
   *                 elapsedInterval: "01:30:45"
   *                 elapsedMs: 5445000
   *                 createdAt: "2024-01-15T08:30:00.000Z"
   *                 updatedAt: "2024-01-15T10:00:45.000Z"
   *                 lastInteractionAt: "2024-01-15T10:00:45.000Z"
   *               timestamp: "2024-01-15T10:00:45.000Z"
   *       400:
   *         description: ID de sesión inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       403:
   *         description: Sesión no pertenece al usuario
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async finishLater(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Finalizando más tarde sesión ${sessionId} para usuario ${userId}`);

      const session = await this.sessionService.finishLater(sessionId, userId);

      const response: ApiResponse = {
        success: true,
        message: "Sesión finalizada más tarde exitosamente",
        data: session,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error finalizando más tarde sesión ${req.params.sessionId}:`, error);

      let statusCode = 500;
      if (error.message.includes("no encontrada")) {
        statusCode = 404;
      } else if (error.message.includes("no pertenece")) {
        statusCode = 403;
      }

      const response: ApiResponse = {
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
   *
   * @swagger
   * /sessions/pending/aged:
   *   get:
   *     summary: Obtener sesiones pendientes antiguas (Cron Job)
   *     description: |
   *       Obtiene sesiones de concentración pendientes que son más antiguas que el número de días especificado.
   *
   *       **Uso del cron job:**
   *       - Ejecutado diariamente a las 2 AM por el sistema automatizado
   *       - Busca sesiones pendientes creadas hace más de 7 días por defecto
   *       - Se utiliza para enviar recordatorios semanales a usuarios con sesiones estancadas
   *       - Ordena resultados por fecha de creación (más antiguas primero)
   *
   *       **Parámetros:**
   *       - `days`: Número de días de antigüedad (default: 7, máximo: razonable para evitar consultas muy grandes)
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 7
   *         description: Número de días de antigüedad para filtrar sesiones
   *         example: 7
   *     responses:
   *       200:
   *         description: Sesiones pendientes obtenidas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/PendingSessionsResponse'
   *             example:
   *               success: true
   *               message: "Sesiones pendientes obtenidas exitosamente"
   *               data:
   *                 - idSesion: 1
   *                   idUsuario: 123
   *                   titulo: "Sesión antigua"
   *                   fechaCreacion: "2024-01-08T08:30:00.000Z"
   *                 - idSesion: 2
   *                   idUsuario: 456
   *                   titulo: "Otra sesión pendiente"
   *                   fechaCreacion: "2024-01-07T10:15:00.000Z"
   *               timestamp: "2024-01-15T02:00:00.000Z"
   *       400:
   *         description: Parámetro 'days' inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "Parámetro 'days' inválido"
   *               timestamp: "2024-01-15T02:00:00.000Z"
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async getPendingAgedSessions(req: Request, res: Response): Promise<void> {
    try {
      // Este endpoint requiere autenticación especial para cron
      // Por ahora permitimos cualquier usuario autenticado
      const days = req.query.days ? parseInt(req.query.days as string) : 7;

      if (isNaN(days) || days <= 0) {
        const response: ApiResponse = {
          success: false,
          message: "Parámetro 'days' inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Obteniendo sesiones pendientes más antiguas que ${days} días`);

      const sessions = await this.sessionService.getPendingSessionsOlderThan(days);

      const response: ApiResponse = {
        success: true,
        message: "Sesiones pendientes obtenidas exitosamente",
        data: sessions,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Error obteniendo sesiones pendientes antiguas:", error);

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Crea una notificación programada para una sesión
   * POST /api/v1/sessions/:sessionId/notify-weekly
   * Endpoint para uso del cron job
   *
   * @swagger
   * /sessions/{sessionId}/notify-weekly:
   *   post:
   *     summary: Crear notificación semanal para sesión (Cron Job)
   *     description: |
   *       Crea una notificación programada semanal para recordar a un usuario sobre una sesión pendiente antigua.
   *
   *       **Funcionamiento del sistema de notificaciones:**
   *       - Ejecutado automáticamente por el cron job diario a las 2 AM
   *       - Crea exactamente una notificación por sesión por semana
   *       - Previene duplicados verificando notificaciones existentes en la misma semana
   *       - Programa el envío para las 9 AM del día actual
   *       - Utiliza el servicio de notificaciones para envío por email
   *
   *       **Contenido de la notificación:**
   *       - Título: "Sesión de concentración pendiente"
   *       - Mensaje: Recordatorio personalizado con ID de sesión
   *       - Programada para envío inmediato (9 AM)
   *     tags: [Sessions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID único de la sesión para la cual crear la notificación
   *         example: 1
   *     responses:
   *       200:
   *         description: Notificación programada creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: "Notificación programada creada exitosamente"
   *               timestamp: "2024-01-15T02:00:00.000Z"
   *       400:
   *         description: ID de sesión inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       401:
   *         description: Usuario no autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       404:
   *         description: Sesión no encontrada o no pendiente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: "Sesión no encontrada o no pendiente"
   *               timestamp: "2024-01-15T02:00:00.000Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  async notifyWeekly(req: Request, res: Response): Promise<void> {
    try {
      // Este endpoint requiere autenticación especial para cron
      const sessionId = parseInt(req.params.sessionId);

      if (isNaN(sessionId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de sesión inválido",
          timestamp: new Date(),
        };
        res.status(400).json(response);
        return;
      }

      logger.info(`Creando notificación semanal para sesión ${sessionId}`);

      // Obtener la sesión para extraer información del usuario
      const session = await this.sessionService.getPendingSessionsOlderThan(9999)
        .then(sessions => sessions.find(s => s.idSesion === sessionId));

      if (!session) {
        const response: ApiResponse = {
          success: false,
          message: "Sesión no encontrada o no pendiente",
          timestamp: new Date(),
        };
        res.status(404).json(response);
        return;
      }

      // Crear notificación programada
      const scheduledAt = new Date();
      scheduledAt.setHours(9, 0, 0, 0); // Programar para las 9 AM

      await this.notificationService.createScheduledNotification({
        userId: session.idUsuario,
        sessionId: session.idSesion,
        title: "Sesión de concentración pendiente",
        message: `Tienes una sesión de concentración pendiente desde hace más de una semana. ¡Continúa con tu progreso!`,
        scheduledAt,
      });

      const response: ApiResponse = {
        success: true,
        message: "Notificación programada creada exitosamente",
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`Error creando notificación para sesión ${req.params.sessionId}:`, error);

      const response: ApiResponse = {
        success: false,
        message: error.message || "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }
}