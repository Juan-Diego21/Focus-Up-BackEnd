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
 *     summary: Obtener todos los reportes del usuario (AGREGADOR - DEPRECATED)
 *     description: |
 *       **⚠️ DEPRECATED**: Este endpoint está marcado como obsoleto.
 *
 *       Se mantiene temporalmente para compatibilidad hacia atrás, pero se recomienda
 *       usar los endpoints dedicados por dominio:
 *
 *       - `GET /api/v1/reports/sessions` - Para reportes de sesiones de concentración
 *       - `GET /api/v1/reports/methods` - Para reportes de métodos de estudio
 *
 *       Este endpoint retorna ambas categorías en arrays separados para facilitar
 *       la transición, pero será removido en futuras versiones.
 *     deprecated: true
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes obtenidos exitosamente (usar endpoints dedicados)
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
 *                   example: "Reportes obtenidos exitosamente (DEPRECATED: use /reports/sessions y /reports/methods)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       description: Reportes de sesiones de concentración
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_reporte:
 *                             type: integer
 *                           id_sesion:
 *                             type: integer
 *                           nombre_sesion:
 *                             type: string
 *                           estado:
 *                             type: string
 *                           tiempo_total:
 *                             type: integer
 *                     methods:
 *                       type: array
 *                       description: Reportes de métodos de estudio
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_reporte:
 *                             type: integer
 *                           id_metodo:
 *                             type: integer
 *                           nombre_metodo:
 *                             type: string
 *                           progreso:
 *                             type: integer
 *                           estado:
 *                             type: string
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
 * /reports/sessions:
 *   get:
 *     summary: Obtener reportes de sesiones de concentración del usuario
 *     description: |
 *       Retorna una lista de reportes de sesiones de concentración para el usuario autenticado.
 *
 *       **Campos incluidos:**
 *       - id_reporte: ID único del reporte de sesión
 *       - id_sesion: ID de la sesión de concentración
 *       - id_usuario: ID del usuario propietario
 *       - nombre_sesion: Título de la sesión
 *       - descripcion: Descripción de la sesión
 *       - estado: Estado actual ('pendiente' | 'completado')
 *       - tiempo_total: Tiempo total transcurrido en milisegundos
 *       - metodo_asociado: Información del método de estudio asociado (opcional)
 *       - album_asociado: Información del álbum de música asociado (opcional)
 *       - fecha_creacion: Fecha de creación de la sesión
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes de sesiones obtenidos exitosamente
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
 *                   example: "Reportes de sesiones obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_reporte:
 *                         type: integer
 *                         example: 1
 *                       id_sesion:
 *                         type: integer
 *                         example: 1
 *                       id_usuario:
 *                         type: integer
 *                         example: 18
 *                       nombre_sesion:
 *                         type: string
 *                         example: "Sesión matutina"
 *                       descripcion:
 *                         type: string
 *                         example: "Enfoque en matemáticas"
 *                       estado:
 *                         type: string
 *                         enum: [pendiente, completado]
 *                         example: "pendiente"
 *                       tiempo_total:
 *                         type: integer
 *                         example: 3600000
 *                       metodo_asociado:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id_metodo:
 *                             type: integer
 *                             example: 1
 *                           nombre_metodo:
 *                             type: string
 *                             example: "Método Feynman"
 *                       album_asociado:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id_album:
 *                             type: integer
 *                             example: 1
 *                           nombre_album:
 *                             type: string
 *                             example: "Jazz Classics"
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T08:30:00.000Z"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/sessions", authenticateToken, reportsController.getUserSessionReports.bind(reportsController));

/**
 * @swagger
 * /reports/methods:
 *   get:
 *     summary: Obtener reportes de métodos de estudio del usuario
 *     description: |
 *       Retorna una lista de reportes de métodos de estudio para el usuario autenticado.
 *
 *       **Campos incluidos:**
 *       - id_reporte: ID único del reporte de método
 *       - id_metodo: ID del método de estudio
 *       - id_usuario: ID del usuario propietario
 *       - nombre_metodo: Nombre del método de estudio
 *       - progreso: Progreso actual (0-100)
 *       - estado: Estado actual del método
 *       - fecha_creacion: Fecha de creación del reporte
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reportes de métodos obtenidos exitosamente
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
 *                   example: "Reportes de métodos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_reporte:
 *                         type: integer
 *                         example: 1
 *                       id_metodo:
 *                         type: integer
 *                         example: 1
 *                       id_usuario:
 *                         type: integer
 *                         example: 18
 *                       nombre_metodo:
 *                         type: string
 *                         example: "Método Feynman"
 *                       progreso:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 100
 *                         example: 50
 *                       estado:
 *                         type: string
 *                         example: "en_progreso"
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T08:30:00.000Z"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/methods", authenticateToken, reportsController.getUserMethodReports.bind(reportsController));

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