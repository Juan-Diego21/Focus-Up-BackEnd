import { Router } from 'express';
import { eventosController } from '../controllers/EventoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Listar eventos
router.get('/', authenticateToken, eventosController.listEventos.bind(eventosController));
/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Listar todos los eventos registrados
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos disponibles
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
 *                     type: object
 *                     properties:
 *                       idEvento:
 *                         type: integer
 *                         description: ID único del evento
 *                       nombreEvento:
 *                         type: string
 *                         description: Nombre del evento
 *                       fechaEvento:
 *                         type: string
 *                         format: date
 *                         description: Fecha del evento
 *                       horaEvento:
 *                         type: string
 *                         description: Hora del evento
 *                       descripcionEvento:
 *                         type: string
 *                         description: Descripción del evento
 *                       idMetodo:
 *                         type: integer
 *                         description: ID del método de estudio asociado
 *                       idAlbum:
 *                         type: integer
 *                         description: ID del álbum de música asociado
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de creación del evento
 *                       fechaActualizacion:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de última actualización
 *       401:
 *         description: No autorizado
 */

// Crear evento
router.post('/crear', authenticateToken, eventosController.crearEvento.bind(eventosController));
/**
 * @swagger
 * /eventos/crear:
 *   post:
 *     summary: Crear un nuevo evento de estudio
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreEvento
 *               - fechaEvento
 *               - horaEvento
 *             properties:
 *               nombreEvento:
 *                 type: string
 *                 description: Nombre del evento
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *               horaEvento:
 *                 type: string
 *                 description: Hora del evento (HH:MM:SS)
 *               descripcionEvento:
 *                 type: string
 *                 description: Descripción opcional del evento
 *               idMetodo:
 *                 type: integer
 *                 description: ID del método de estudio asociado
 *               idAlbum:
 *                 type: integer
 *                 description: ID del álbum de música opcional
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       400:
 *         description: Datos inválidos o entidades relacionadas no válidas
 *       401:
 *         description: No autorizado
 */

// Actualizar evento
router.put('/:id', authenticateToken, eventosController.updateEvento.bind(eventosController));
/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     summary: Actualizar un evento existente
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreEvento:
 *                 type: string
 *                 description: Nombre del evento
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *               horaEvento:
 *                 type: string
 *                 description: Hora del evento (HH:MM:SS)
 *               descripcionEvento:
 *                 type: string
 *                 description: Descripción del evento
 *               idMetodo:
 *                 type: integer
 *                 description: ID del método de estudio
 *               idAlbum:
 *                 type: integer
 *                 description: ID del álbum de música (puede ser null para remover)
 *     responses:
 *       200:
 *         description: Evento actualizado correctamente
 *       404:
 *         description: Evento no encontrado o datos inválidos
 *       401:
 *         description: No autorizado
 */

// Eliminar evento
router.delete('/:id', authenticateToken, eventosController.deleteEvento.bind(eventosController));
/**
 * @swagger
 * /eventos/{id}:
 *   delete:
 *     summary: Eliminar un evento por ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evento eliminado correctamente
 *       404:
 *         description: Evento no encontrado
 */

export default router;
