import { Router } from 'express';
import { eventosController } from '../controllers/EventoController';
import { authenticateToken } from '../middleware/auth';
import { EventoService } from '../services/EventosService';

const router = Router();

// Controlador temporal para rutas adicionales de eventos
const eventosControllerExtendido = {
  /**
   * Marca un evento como completado
   */
  async marcarComoCompletado(req: any, res: any) {
    try {
      const { id } = req.params;
      const idEvento = parseInt(id, 10);
      const userId = req.user.userId;

      const result = await EventoService.marcarComoCompletado(idEvento, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en marcarComoCompletado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * Marca un evento como pendiente
   */
  async marcarComoPendiente(req: any, res: any) {
    try {
      const { id } = req.params;
      const idEvento = parseInt(id, 10);
      const userId = req.user.userId;

      const result = await EventoService.marcarComoPendiente(idEvento, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en marcarComoPendiente:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  /**
   * Actualiza el estado de un evento
   */
  async actualizarEstado(req: any, res: any) {
    try {
      const { id } = req.params;
      const idEvento = parseInt(id, 10);
      const userId = req.user.userId;
      const { estado } = req.body;

      // Validar que el estado sea válido
      const validEstados = [null, 'pendiente', 'completado'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser null, "pendiente" o "completado"'
        });
      }

      const result = await EventoService.actualizarEstado(idEvento, userId, estado);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
};

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
 *                         example: "2025-11-21"
 *                         description: Fecha del evento en formato YYYY-MM-DD
 *                       horaEvento:
 *                         type: string
 *                         description: Hora del evento
 *                       descripcionEvento:
 *                         type: string
 *                         description: Descripción del evento
 *                       status:
 *                         type: string
 *                         enum: [null, pending, completed]
 *                         description: Estado del evento
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
 * */

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
 *               status:
 *                 type: string
 *                 enum: [null, pending, completed]
 *                 description: Estado opcional del evento
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
 * */

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
 *               status:
 *                 type: string
 *                 enum: [null, pending, completed]
 *                 description: Estado del evento
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
 * */

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
 * */

// Marcar evento como completado
router.patch('/:id/completed', authenticateToken, eventosControllerExtendido.marcarComoCompletado.bind(eventosControllerExtendido));
/**
 * @swagger
 * /eventos/{id}/completed:
 *   patch:
 *     summary: Marcar un evento como completado
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento a marcar como completado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evento marcado como completado
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 * */

// Marcar evento como pendiente
router.patch('/:id/pending', authenticateToken, eventosControllerExtendido.marcarComoPendiente.bind(eventosControllerExtendido));
/**
 * @swagger
 * /eventos/{id}/pending:
 *   patch:
 *     summary: Marcar un evento como pendiente
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento a marcar como pendiente
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evento marcado como pendiente
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 * */

// Actualizar estado del evento
router.patch('/:id', authenticateToken, eventosControllerExtendido.actualizarEstado.bind(eventosControllerExtendido));
/**
 * @swagger
 * /eventos/{id}:
 *   patch:
 *     summary: Actualizar el estado de un evento
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento cuyo estado se va a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [null, pending, completed]
 *                 description: Nuevo estado del evento
 *                 example: "pending"
 *     responses:
 *       200:
 *         description: Estado del evento actualizado correctamente
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
 *                   example: "Estado del evento actualizado a pending"
 *       400:
 *         description: Estado inválido o datos incorrectos
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 * */

export default router;
