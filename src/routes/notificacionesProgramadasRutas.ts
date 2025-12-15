import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { NotificacionesProgramadasController } from '../controllers/NotificacionesProgramadasController';

const router = Router();

// Instancia del controlador para manejar las rutas de notificaciones programadas
const notificacionesProgramadasController = new NotificacionesProgramadasController();

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