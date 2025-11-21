import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { NotificacionesProgramadasService } from '../services/NotificacionesProgramadasService';

const router = Router();

// Controlador para las rutas de notificaciones programadas
const notificacionesProgramadasController = {
  /**
   * Crea una nueva notificación programada
   * Valida datos de entrada y registra la notificación para envío futuro
   */
  async createScheduledNotification(req: any, res: any) {
    try {
      const { idUsuario, tipo, titulo, mensaje, fechaProgramada } = req.body;

      // Validar que el usuario autenticado pueda crear notificaciones para sí mismo
      if (req.user.userId !== idUsuario) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para crear notificaciones para este usuario'
        });
      }

      // Validar fecha programada
      const fechaProgramadaDate = new Date(fechaProgramada);
      if (isNaN(fechaProgramadaDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Fecha programada inválida'
        });
      }

      const result = await NotificacionesProgramadasService.createScheduledNotification({
        idUsuario,
        tipo,
        titulo,
        mensaje,
        fechaProgramada: fechaProgramadaDate
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error en createScheduledNotification:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
    * Obtiene todas las notificaciones programadas
    * Retorna lista completa de notificaciones con información detallada
    */
  async getScheduledNotifications(req: any, res: any) {
    try {
      const userId = req.user.userId;
      const result = await NotificacionesProgramadasService.getUpcomingEventsWithNotifications(userId);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en getScheduledNotifications:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * Marca una notificación específica como enviada
   * Actualiza el estado de la notificación después del envío exitoso del email
   */
  async markAsSent(req: any, res: any) {
    try {
      const { id } = req.params;
      const idNotificacion = parseInt(id, 10);

      if (isNaN(idNotificacion)) {
        return res.status(400).json({
          success: false,
          error: 'ID de notificación inválido'
        });
      }

      const result = await NotificacionesProgramadasService.markAsSent(idNotificacion);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en markAsSent:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

// Crear notificación programada
router.post('/programadas', authenticateToken, notificacionesProgramadasController.createScheduledNotification.bind(notificacionesProgramadasController));
/**
 * @swagger
 * /notificaciones/programadas:
 *   post:
 *     summary: Crear una nueva notificación programada
 *     tags: [Notificaciones Programadas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *               - tipo
 *               - fechaProgramada
 *             properties:
 *               idUsuario:
 *                 type: integer
 *                 description: ID del usuario que recibirá la notificación
 *               tipo:
 *                 type: string
 *                 description: Tipo de notificación (ej. 'recordatorio', 'motivacion')
 *               titulo:
 *                 type: string
 *                 description: Título opcional de la notificación
 *               mensaje:
 *                 type: string
 *                 description: Contenido del mensaje
 *               fechaProgramada:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora programada para el envío
 *     responses:
 *       201:
 *         description: Notificación programada creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No autorizado
 * */

// Obtener notificaciones programadas
router.get('/programadas', authenticateToken, notificacionesProgramadasController.getScheduledNotifications.bind(notificacionesProgramadasController));
/**
 * @swagger
 * /notificaciones/programadas:
 *   get:
 *     summary: Obtener todas las notificaciones programadas pendientes
 *     tags: [Notificaciones Programadas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones programadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "event"
 *                           idEvento:
 *                             type: integer
 *                             description: ID del evento
 *                           nombreEvento:
 *                             type: string
 *                             description: Nombre del evento
 *                           notificationTime:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha y hora de la notificación
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "incomplete_study_method"
 *                           idReporte:
 *                             type: integer
 *                             description: ID del reporte de método
 *                           nombreMetodo:
 *                             type: string
 *                             description: Nombre del método de estudio
 *                           progreso:
 *                             type: integer
 *                             description: Progreso actual del método
 *                           notificationTime:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha y hora de la notificación
 *                       - type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "weekly_motivation"
 *                           notificationTime:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha y hora de la notificación
 *                           templateId:
 *                             type: integer
 *                             description: ID del template motivacional semanal
 *       401:
 *         description: No autorizado
 * */

// Marcar notificación como enviada
router.patch('/programadas/:id/enviada', authenticateToken, notificacionesProgramadasController.markAsSent.bind(notificacionesProgramadasController));
/**
 * @swagger
 * /notificaciones/programadas/{id}/enviada:
 *   patch:
 *     summary: Marcar una notificación como enviada
 *     tags: [Notificaciones Programadas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la notificación a marcar como enviada
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación marcada como enviada
 *       400:
 *         description: ID inválido o notificación ya enviada
 *       404:
 *         description: Notificación no encontrada
 *       401:
 *         description: No autorizado
 * */

export default router;