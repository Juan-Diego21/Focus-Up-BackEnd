import { Router } from "express";
import { reportsController } from "../controllers/ReportsController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /reports/active-methods:
 *   post:
 *     summary: Crear un método de estudio activo para el usuario
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idMetodo
 *             properties:
 *               idMetodo:
 *                 type: integer
 *                 description: ID del método de estudio a activar
 *                 example: 1
 *     responses:
 *       201:
 *         description: Método activo creado exitosamente
 *       400:
 *         description: Datos inválidos o método ya activo
 *       401:
 *         description: No autorizado
 */
router.post("/active-methods", authenticateToken, reportsController.createActiveMethod.bind(reportsController));

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Obtener todos los reportes del usuario (métodos y sesiones)
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Reportes obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     metodos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           metodo:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               nombre:
 *                                 type: string
 *                               descripcion:
 *                                 type: string
 *                               color:
 *                                 type: string
 *                               imagen:
 *                                 type: string
 *                           progreso:
 *                             type: integer
 *                             enum: [0, 50, 100]
 *                           estado:
 *                             type: string
 *                           duracionTotal:
 *                             type: integer
 *                           fechaInicio:
 *                             type: string
 *                             format: date-time
 *                           fechaFin:
 *                             type: string
 *                             format: date-time
 *                     sesiones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           musica:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               nombre:
 *                                 type: string
 *                               artista:
 *                                 type: string
 *                               genero:
 *                                 type: string
 *                           duracion:
 *                             type: integer
 *                           fechaProgramada:
 *                             type: string
 *                             format: date-time
 *                           estado:
 *                             type: string
 *                           fechaInicio:
 *                             type: string
 *                             format: date-time
 *                           fechaFin:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, reportsController.getUserReports.bind(reportsController));

/**
 * @swagger
 * /reports/methods/{id}/progress:
 *   patch:
 *     summary: Actualizar el progreso de un método de estudio
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método realizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progreso:
 *                 type: integer
 *                 enum: [0, 50, 100]
 *                 description: Progreso del método (0=iniciado, 50=mitad, 100=completado)
 *                 example: 50
 *               duracionTotal:
 *                 type: integer
 *                 description: Duración total en segundos
 *                 example: 1800
 *               finalizar:
 *                 type: boolean
 *                 description: Marcar el método como finalizado
 *                 example: true
 *     responses:
 *       200:
 *         description: Progreso del método actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Método no encontrado
 */
router.patch("/methods/:id/progress", authenticateToken, reportsController.updateMethodProgress.bind(reportsController));

/**
 * @swagger
 * /reports/sessions/{id}/progress:
 *   patch:
 *     summary: Actualizar el progreso de una sesión de concentración
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión realizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_proceso, completada, cancelada]
 *                 description: Estado de la sesión
 *                 example: "completada"
 *               duracion:
 *                 type: integer
 *                 description: Duración en segundos
 *                 example: 1800
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de inicio
 *                 example: "2023-12-01T10:00:00Z"
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de fin
 *                 example: "2023-12-01T11:30:00Z"
 *     responses:
 *       200:
 *         description: Progreso de la sesión actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Sesión no encontrada
 */
router.patch("/sessions/:id/progress", authenticateToken, reportsController.updateSessionProgress.bind(reportsController));

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Eliminar un reporte por ID
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reporte a eliminar
 *     responses:
 *       200:
 *         description: Reporte eliminado correctamente
 *       404:
 *         description: Reporte no encontrado o no autorizado
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", authenticateToken, reportsController.deleteReport.bind(reportsController));

export default router;