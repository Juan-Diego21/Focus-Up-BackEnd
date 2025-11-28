import { Router } from "express";
import { reportsController } from "../controllers/ReportsController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /reports/active-methods:
 *   post:
 *     summary: Crear método de estudio activo
 *     description: Activa un método de estudio para seguimiento de progreso del usuario
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
 *         description: Método activado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos o método ya activo
 *       401:
 *         description: No autorizado
 */
router.post("/active-methods", authenticateToken, reportsController.createActiveMethod.bind(reportsController));


/**
 * @swagger
 * /reports/methods/{id}/progress:
 *   patch:
 *     summary: Actualizar progreso de método de estudio
 *     description: Actualiza el progreso, duración y estado de finalización de un método activo
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
 *                 description: Nivel de progreso (0=iniciado, 50=mitad, 100=completado)
 *                 example: 50
 *               duracionTotal:
 *                 type: integer
 *                 description: Duración total en segundos
 *                 example: 1800
 *               finalizar:
 *                 type: boolean
 *                 description: Marcar como finalizado
 *                 example: true
 *     responses:
 *       200:
 *         description: Progreso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *     summary: Actualizar progreso de sesión de concentración
 *     description: Actualiza estado, tiempo transcurrido y notas de una sesión. Acepta formatos nuevos (status/elapsedMs) y antiguos (estado/duracion) para compatibilidad.
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
 *               status:
 *                 type: string
 *                 enum: [completed, pending]
 *                 description: Estado de la sesión (formato recomendado)
 *                 example: "completed"
 *               estado:
 *                 type: string
 *                 enum: [completed, pending]
 *                 description: Estado de la sesión (formato antiguo)
 *                 example: "completed"
 *               elapsedMs:
 *                 type: integer
 *                 description: Tiempo en milisegundos (formato recomendado)
 *                 example: 1800000
 *               duracion:
 *                 type: integer
 *                 description: Duración en segundos (formato antiguo)
 *                 example: 1800
 *               notes:
 *                 type: string
 *                 description: Notas opcionales sobre la sesión
 *                 example: "Sesión completada exitosamente"
 *     responses:
 *       200:
 *         description: Progreso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 * /reports/sessions:
 *   get:
 *     summary: Obtener reportes de sesiones del usuario
 *     description: Retorna lista de reportes de sesiones de concentración con información de métodos y álbumes asociados
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 */
router.get("/sessions", authenticateToken, reportsController.getUserSessionReports.bind(reportsController));

/**
 * @swagger
 * /reports/methods:
 *   get:
 *     summary: Obtener reportes de métodos del usuario
 *     description: Retorna lista de reportes de métodos de estudio con progreso y estado actual
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado
 */
router.get("/methods", authenticateToken, reportsController.getUserMethodReports.bind(reportsController));

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Eliminar reporte por ID
 *     description: Elimina un reporte de método de estudio o sesión de concentración. Busca primero en métodos, luego en sesiones.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Reporte no encontrado
 *       401:
 *         description: No autorizado
 */
router.delete("/:id", authenticateToken, reportsController.deleteReport.bind(reportsController));

export default router;