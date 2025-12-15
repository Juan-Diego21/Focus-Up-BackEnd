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
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 description: "Título opcional de la sesión"
 *                 example: "Sesión de estudio matutina"
 *               description:
 *                 type: string
 *                 description: "Descripción opcional de la sesión"
 *                 example: "Enfoque en matemáticas capítulo 5"
 *               type:
 *                 type: string
 *                 enum: [rapid, scheduled]
 *                 description: "Tipo de sesión (rapid o scheduled)"
 *                 example: "rapid"
 *               eventId:
 *                 type: integer
 *                 description: "ID del evento asociado (opcional)"
 *                 example: 123
 *               methodId:
 *                 type: integer
 *                 description: "ID del método de estudio asociado (opcional)"
 *                 example: 456
 *               albumId:
 *                 type: integer
 *                 description: "ID del álbum de música asociado (opcional)"
 *                 example: 789
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: "Hora de inicio opcional en formato ISO"
 *                 example: "2024-01-15T08:30:00.000Z"
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente
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
 *                   example: "Sesión creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "Sesión de estudio matutina"
 *                     description:
 *                       type: string
 *                       example: "Enfoque en matemáticas capítulo 5"
 *                     type:
 *                       type: string
 *                       enum: [rapid, scheduled]
 *                       example: "rapid"
 *                     status:
 *                       type: string
 *                       enum: [pendiente, completada]
 *                       example: "pending"
 *                     methodId:
 *                       type: integer
 *                       example: 456
 *                     albumId:
 *                       type: integer
 *                       example: 789
 *                     elapsedInterval:
 *                       type: string
 *                       example: "00:00:00"
 *                     elapsedMs:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     lastInteractionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       400:
 *         description: Datos inválidos o tipo de sesión incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Tipo de sesión inválido. Debe ser 'rapid' o 'scheduled'"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 */
router.post("/", sessionController.createSession.bind(sessionController));

/**
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "Sesión de estudio matutina"
 *                     description:
 *                       type: string
 *                       example: "Enfoque en matemáticas capítulo 5"
 *                     type:
 *                       type: string
 *                       enum: [rapid, scheduled]
 *                       example: "rapid"
 *                     status:
 *                       type: string
 *                       enum: [pendiente, completada]
 *                       example: "pending"
 *                     methodId:
 *                       type: integer
 *                       example: 456
 *                     albumId:
 *                       type: integer
 *                       example: 789
 *                     elapsedInterval:
 *                       type: string
 *                       example: "01:30:45"
 *                     elapsedMs:
 *                       type: integer
 *                       example: 5445000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:15:30.000Z"
 *                     lastInteractionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:15:30.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 *       400:
 *         description: ID de sesión inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ID de sesión inválido"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 *       403:
 *         description: Sesión no pertenece al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sesión no encontrada o no pertenece al usuario"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sesión no encontrada o no pertenece al usuario"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:15:30.000Z"
 */
router.get("/:sessionId", checkSessionOwnership, sessionController.getSession.bind(sessionController));


/**
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: "Título opcional de la sesión"
 *                 example: "Sesión actualizada"
 *               description:
 *                 type: string
 *                 description: "Descripción opcional de la sesión"
 *                 example: "Nueva descripción de la sesión"
 *               methodId:
 *                 type: integer
 *                 description: "ID del método de estudio asociado (opcional)"
 *                 example: 457
 *               albumId:
 *                 type: integer
 *                 description: "ID del álbum de música asociado (opcional)"
 *                 example: 790
 *     responses:
 *       200:
 *         description: Sesión actualizada exitosamente
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
 *                   example: "Sesión actualizada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "Sesión actualizada"
 *                     description:
 *                       type: string
 *                       example: "Nueva descripción de la sesión"
 *                     type:
 *                       type: string
 *                       enum: [rapid, scheduled]
 *                       example: "rapid"
 *                     status:
 *                       type: string
 *                       enum: [pendiente, completada]
 *                       example: "pending"
 *                     methodId:
 *                       type: integer
 *                       example: 457
 *                     albumId:
 *                       type: integer
 *                       example: 790
 *                     elapsedInterval:
 *                       type: string
 *                       example: "01:30:45"
 *                     elapsedMs:
 *                       type: integer
 *                       example: 5445000
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:45:30.000Z"
 *                     lastInteractionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:15:30.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       400:
 *         description: Datos inválidos o ID de sesión incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos inválidos"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       403:
 *         description: Sesión no pertenece al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sesión no pertenece al usuario"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Sesión no encontrada"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       409:
 *         description: Conflicto de concurrencia (datos modificados por otro proceso)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Los datos han sido modificados por otro proceso"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:45:30.000Z"
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
 *     summary: Obtener sesiones pendientes antiguas (Cron Job)
 *     description: |
 *       Obtiene sesiones de concentración pendientes que son más antiguas que el número de días especificado.
 *
 *       **Uso del cron job:**
 *       - Ejecutado diariamente a las 2 AM por el sistema automatizado
 *       - Busca sesiones pendientes con ultima_interaccion o fecha_actualizacion más antiguas que los días especificados
 *       - Se utiliza para enviar recordatorios semanales a usuarios con sesiones estancadas
 *       - Ordena resultados por fecha de creación (más antiguas primero)
 *
 *       **Parámetros:**
 *       - `days`: Número de días de antigüedad (default: 7)
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesiones pendientes obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idSesion:
 *                         type: integer
 *                         example: 1
 *                       idUsuario:
 *                         type: integer
 *                         example: 123
 *                       titulo:
 *                         type: string
 *                         example: "Sesión antigua"
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-08T08:30:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T02:00:00.000Z"
 *       400:
 *         description: Parámetro 'days' inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Parámetro 'days' inválido"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T02:00:00.000Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T02:00:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T02:00:00.000Z"
 */
router.get("/pending/aged", sessionController.getPendingAgedSessions.bind(sessionController));

/**
 * @swagger
 * /sessions/from-event/{eventId}:
 *   get:
 *     summary: Crear sesión desde evento de concentración
 *     description: |
 *       Crea una nueva sesión de concentración a partir de un evento con tipo_evento="concentracion".
 *
 *       **Validaciones:**
 *       - El usuario debe estar autenticado
 *       - El evento debe existir y pertenecer al usuario
 *       - El evento debe tener tipo_evento="concentracion"
 *       - No se permite crear sesiones duplicadas del mismo evento
 *
 *       **Datos de la sesión creada:**
 *       - title: nombre del evento
 *       - description: descripción del evento
 *       - methodId: id_metodo del evento
 *       - albumId: id_album del evento
 *       - type: "scheduled"
 *       - status: "pending"
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
 *         example: 1
 *     responses:
 *       201:
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
 *                     sessionId:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 123
 *                     title:
 *                       type: string
 *                       example: "Sesión de concentración"
 *                     description:
 *                       type: string
 *                       example: "Sesión creada desde evento"
 *                     type:
 *                       type: string
 *                       enum: [rapid, scheduled]
 *                       example: "scheduled"
 *                     status:
 *                       type: string
 *                       enum: [pendiente, completada]
 *                       example: "pending"
 *                     methodId:
 *                       type: integer
 *                       example: 456
 *                     albumId:
 *                       type: integer
 *                       example: 789
 *                     elapsedInterval:
 *                       type: string
 *                       example: "00:00:00"
 *                     elapsedMs:
 *                       type: integer
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     lastInteractionAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:30:00.000Z"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       400:
 *         description: Evento no es de tipo concentración o ya existe sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "El evento no es de tipo concentración"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       401:
 *         description: Usuario no autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       403:
 *         description: Evento no pertenece al usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Evento no pertenece al usuario"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Evento no encontrado"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T08:30:00.000Z"
 */
router.get("/from-event/:eventId", sessionController.createSessionFromEvent.bind(sessionController));


export default router;