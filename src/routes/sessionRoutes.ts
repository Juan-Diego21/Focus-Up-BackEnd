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
 * POST /api/v1/sessions
 * Crear una nueva sesión de concentración
 */
router.post("/", sessionController.createSession.bind(sessionController));

/**
 * GET /api/v1/sessions/:sessionId
 * Obtener detalles de una sesión específica
 */
router.get("/:sessionId", checkSessionOwnership, sessionController.getSession.bind(sessionController));


/**
 * PATCH /api/v1/sessions/:sessionId
 * Actualizar metadatos de una sesión (título, descripción, método, álbum)
 */
router.patch(
  "/:sessionId",
  checkSessionOwnership,
  optimisticConcurrencyCheck,
  sessionController.updateSession.bind(sessionController)
);



/**
 * GET /api/v1/sessions/pending/aged
 * Obtener sesiones pendientes más antiguas que X días (para cron)
 * Nota: Este endpoint podría requerir autenticación especial para cron
 */
router.get("/pending/aged", sessionController.getPendingAgedSessions.bind(sessionController));

/**
 * @swagger
 * /sessions/from-event/{eventId}:
 *   get:
 *     summary: Crear una sesión de concentración desde un evento
 *     description: |
 *       Crea automáticamente una sesión de concentración basada en un evento existente.
 *
 *       **Requisitos del evento:**
 *       - El evento debe pertenecer al usuario autenticado
 *       - El evento debe ser de tipo "concentracion"
 *       - No debe existir ya una sesión creada para este evento
 *
 *       **Datos utilizados del evento:**
 *       - `nombreEvento` → `titulo` de la sesión
 *       - `descripcionEvento` → `descripcion` de la sesión
 *       - `idMetodo` → `idMetodo` de la sesión
 *       - `idAlbum` → `idAlbum` de la sesión
 *
 *       **Características de la sesión creada:**
 *       - Estado inicial: "pendiente"
 *       - Tipo: "scheduled"
 *       - Tiempo transcurrido inicial: "00:00:00"
 *       - Vinculada al evento original
 *     tags: [Sessions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID del evento de concentración
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Sesión creada exitosamente desde el evento
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
 *                   example: "Sesión creada exitosamente desde el evento"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_sesion:
 *                       type: integer
 *                       example: 1
 *                     titulo:
 *                       type: string
 *                       example: "Sesión de concentración profunda"
 *                     descripcion:
 *                       type: string
 *                       example: "Sesión de estudio intensivo"
 *                     estado:
 *                       type: string
 *                       example: "pendiente"
 *                     tipo:
 *                       type: string
 *                       example: "scheduled"
 *                     id_evento:
 *                       type: integer
 *                       example: 1
 *                     id_metodo:
 *                       type: integer
 *                       example: 5
 *                     id_album:
 *                       type: integer
 *                       example: 1
 *                     tiempo_transcurrido:
 *                       type: string
 *                       example: "00:00:00"
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-22T09:00:00.000Z"
 *                     fecha_actualizacion:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-22T09:00:00.000Z"
 *                     ultima_interaccion:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-22T09:00:00.000Z"
 *       400:
 *         description: Evento no válido para crear sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   examples:
 *                     evento_no_encontrado: "Evento no encontrado"
 *                     evento_no_concentracion: "El evento no es de tipo concentración"
 *                     evento_no_propietario: "Evento no pertenece al usuario"
 *                     sesion_ya_existe: "Ya existe una sesión para este evento"
 *       401:
 *         description: No autorizado
 * */
router.get("/from-event/:eventId", sessionController.createSessionFromEvent.bind(sessionController));


export default router;