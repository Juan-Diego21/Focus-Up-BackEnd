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


export default router;