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
 * GET /api/v1/users/:userId/sessions
 * Listar sesiones de un usuario con filtros opcionales
 */
router.get("/users/:userId/sessions", sessionController.listUserSessions.bind(sessionController));

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
 * POST /api/v1/sessions/:sessionId/pause
 * Pausar el temporizador de una sesión
 */
router.post("/:sessionId/pause", checkSessionOwnership, sessionController.pauseSession.bind(sessionController));

/**
 * POST /api/v1/sessions/:sessionId/resume
 * Reanudar el temporizador de una sesión
 */
router.post("/:sessionId/resume", checkSessionOwnership, sessionController.resumeSession.bind(sessionController));

/**
 * POST /api/v1/sessions/:sessionId/complete
 * Completar una sesión de concentración
 */
router.post(
  "/:sessionId/complete",
  checkSessionOwnership,
  sessionController.completeSession.bind(sessionController)
);

/**
 * POST /api/v1/sessions/:sessionId/finish-later
 * Finalizar una sesión más tarde (pausar y mantener pendiente)
 */
router.post("/:sessionId/finish-later", checkSessionOwnership, sessionController.finishLater.bind(sessionController));

/**
 * GET /api/v1/sessions/pending/aged
 * Obtener sesiones pendientes más antiguas que X días (para cron)
 * Nota: Este endpoint podría requerir autenticación especial para cron
 */
router.get("/pending/aged", sessionController.getPendingAgedSessions.bind(sessionController));

/**
 * POST /api/v1/sessions/:sessionId/notify-weekly
 * Crear notificación programada para una sesión (para cron)
 * Nota: Este endpoint podría requerir autenticación especial para cron
 */
router.post("/:sessionId/notify-weekly", sessionController.notifyWeekly.bind(sessionController));

export default router;