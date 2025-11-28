import { Router } from "express";
import { SessionController } from "../controllers/SessionController";
import { authenticateToken } from "../middleware/auth";
import { checkSessionOwnership, snakeToCamelCase, optimisticConcurrencyCheck } from "../middleware/session";

/**
 * Router para las rutas de sesiones de concentración
 * Define todas las rutas REST para gestión de sesiones
 */
const router = Router();
const sessionController = new SessionController();

// Middleware global para todas las rutas de sesiones
router.use(authenticateToken);
router.use(snakeToCamelCase);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Crear nueva sesión de concentración
 *     description: Crea una sesión de concentración con los parámetros especificados
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionDto'
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post("/", sessionController.createSession.bind(sessionController));

/**
 * @swagger
 * /sessions/{sessionId}:
 *   get:
 *     summary: Obtener detalles de sesión específica
 *     description: Retorna información completa de una sesión de concentración
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión
 *     responses:
 *       200:
 *         description: Detalles de la sesión obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autorizado
 */
router.get("/:sessionId", checkSessionOwnership, sessionController.getSession.bind(sessionController));


/**
 * @swagger
 * /sessions/{sessionId}:
 *   patch:
 *     summary: Actualizar metadatos de sesión
 *     description: Actualiza título, descripción, método de estudio o álbum de música de una sesión
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sesión a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSessionDto'
 *     responses:
 *       200:
 *         description: Sesión actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autorizado
 */
router.patch(
  "/:sessionId",
  checkSessionOwnership,
  optimisticConcurrencyCheck,
  sessionController.updateSession.bind(sessionController)
);



/**
 * @swagger
 * /sessions/pending/aged:
 *   get:
 *     summary: Obtener sesiones pendientes antiguas
 *     description: Retorna sesiones pendientes más antiguas que el número de días especificado (usado por procesos automatizados)
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Número de días de antigüedad (por defecto 7)
 *     responses:
 *       200:
 *         description: Lista de sesiones pendientes antiguas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PendingSessionsResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/pending/aged", sessionController.getPendingAgedSessions.bind(sessionController));

/**
 * @swagger
 * /sessions/from-event/{eventId}:
 *   get:
 *     summary: Crear sesión desde evento existente
 *     description: Crea automáticamente una sesión de concentración basada en un evento de concentración válido del usuario
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento de concentración
 *     responses:
 *       200:
 *         description: Sesión creada exitosamente desde el evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Evento inválido o ya tiene sesión asociada
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 */
router.get("/from-event/:eventId", sessionController.createSessionFromEvent.bind(sessionController));


export default router;