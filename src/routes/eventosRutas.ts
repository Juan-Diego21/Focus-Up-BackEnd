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
 *     summary: Listar todos los eventos del usuario autenticado
 *     description: |
 *       Retorna una lista de eventos pertenecientes al usuario autenticado.
 *
 *       **Campos incluidos para todos los eventos:**
 *       - idEvento: ID único del evento
 *       - nombreEvento: Nombre del evento
 *       - fechaEvento: Fecha del evento (YYYY-MM-DD)
 *       - horaEvento: Hora del evento
 *       - descripcionEvento: Descripción del evento
 *       - tipoEvento: Tipo de evento ("normal" o "concentracion")
 *       - estado: Estado del evento (null, "pendiente", "completado")
 *       - idMetodo: ID del método de estudio asociado
 *       - idAlbum: ID del álbum de música asociado
 *       - fechaCreacion: Fecha de creación
 *       - fechaActualizacion: Fecha de última actualización
 *
 *       **Campos adicionales para eventos de concentración:**
 *       - metodo: Objeto completo del método de estudio (idMetodo, nombreMetodo, descripcion)
 *       - album: Objeto completo del álbum de música (idAlbum, nombreAlbum, descripcion, genero)
 *     tags: [Eventos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
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
 *                     oneOf:
 *                       - type: object
 *                         description: Evento normal
 *                         properties:
 *                           idEvento:
 *                             type: integer
 *                             example: 1
 *                           nombreEvento:
 *                             type: string
 *                             example: "Estudio de matemáticas"
 *                           fechaEvento:
 *                             type: string
 *                             format: date
 *                             example: "2025-11-21"
 *                           horaEvento:
 *                             type: string
 *                             example: "14:30:00"
 *                           descripcionEvento:
 *                             type: string
 *                             example: "Repaso de álgebra"
 *                           tipoEvento:
 *                             type: string
 *                             example: "normal"
 *                           estado:
 *                             type: string
 *                             enum: [null, pendiente, completado]
 *                             example: "pendiente"
 *                           idMetodo:
 *                             type: integer
 *                             example: 1
 *                           idAlbum:
 *                             type: integer
 *                             example: 2
 *                           fechaCreacion:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-20T10:00:00.000Z"
 *                           fechaActualizacion:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-20T10:00:00.000Z"
 *                       - type: object
 *                         description: Evento de concentración
 *                         properties:
 *                           idEvento:
 *                             type: integer
 *                             example: 2
 *                           nombreEvento:
 *                             type: string
 *                             example: "Sesión de concentración profunda"
 *                           fechaEvento:
 *                             type: string
 *                             format: date
 *                             example: "2025-11-22"
 *                           horaEvento:
 *                             type: string
 *                             example: "09:00:00"
 *                           descripcionEvento:
 *                             type: string
 *                             example: "Sesión de estudio intensivo"
 *                           tipoEvento:
 *                             type: string
 *                             example: "concentracion"
 *                           estado:
 *                             type: string
 *                             enum: [null, pendiente, completado]
 *                             example: null
 *                           idMetodo:
 *                             type: integer
 *                             example: 5
 *                           idAlbum:
 *                             type: integer
 *                             example: 1
 *                           metodo:
 *                             type: object
 *                             properties:
 *                               idMetodo:
 *                                 type: integer
 *                                 example: 5
 *                               nombreMetodo:
 *                                 type: string
 *                                 example: "Método Feynman"
 *                               descripcion:
 *                                 type: string
 *                                 example: "Aprender explicando"
 *                           album:
 *                             type: object
 *                             properties:
 *                               idAlbum:
 *                                 type: integer
 *                                 example: 1
 *                               nombreAlbum:
 *                                 type: string
 *                                 example: "LoFi"
 *                               descripcion:
 *                                 type: string
 *                                 example: "Beats relajantes para estudio"
 *                               genero:
 *                                 type: string
 *                                 example: "LoFi"
 *                           fechaCreacion:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-20T11:00:00.000Z"
 *                           fechaActualizacion:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-20T11:00:00.000Z"
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
 *     description: |
 *       Crea un nuevo evento de estudio para el usuario autenticado.
 *
 *       **Tipos de eventos soportados:**
 *       - `normal`: Evento de estudio estándar
 *       - `concentracion`: Evento de concentración que puede generar sesiones automáticamente
 *
 *       **Campos opcionales:**
 *       - Para eventos de concentración, se recomienda incluir `idMetodo` e `idAlbum`
 *       - El campo `estado` puede ser null (por defecto), "pendiente" o "completado"
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
 *                 example: "Sesión de concentración profunda"
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *                 example: "2025-11-22"
 *               horaEvento:
 *                 type: string
 *                 description: Hora del evento (HH:MM:SS)
 *                 example: "09:00:00"
 *               descripcionEvento:
 *                 type: string
 *                 description: Descripción opcional del evento
 *                 example: "Sesión de estudio intensivo con música LoFi"
 *               tipoEvento:
 *                 type: string
 *                 enum: [normal, concentracion]
 *                 description: Tipo de evento (por defecto "normal")
 *                 example: "concentracion"
 *               estado:
 *                 type: string
 *                 enum: [null, pendiente, completado]
 *                 description: Estado opcional del evento (por defecto null)
 *                 example: null
 *               idMetodo:
 *                 type: integer
 *                 description: ID del método de estudio asociado (recomendado para eventos de concentración)
 *                 example: 5
 *               idAlbum:
 *                 type: integer
 *                 description: ID del álbum de música opcional (recomendado para eventos de concentración)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
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
 *                   example: "Evento creado correctamente"
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Evento normal
 *                       properties:
 *                         idEvento:
 *                           type: integer
 *                           example: 1
 *                         nombreEvento:
 *                           type: string
 *                           example: "Estudio de matemáticas"
 *                         tipoEvento:
 *                           type: string
 *                           example: "normal"
 *                         estado:
 *                           type: string
 *                           example: null
 *                         idMetodo:
 *                           type: integer
 *                           example: 1
 *                         idAlbum:
 *                           type: integer
 *                           example: 2
 *                     - type: object
 *                       description: Evento de concentración
 *                       properties:
 *                         idEvento:
 *                           type: integer
 *                           example: 2
 *                         nombreEvento:
 *                           type: string
 *                           example: "Sesión de concentración profunda"
 *                         tipoEvento:
 *                           type: string
 *                           example: "concentracion"
 *                         estado:
 *                           type: string
 *                           example: null
 *                         idMetodo:
 *                           type: integer
 *                           example: 5
 *                         idAlbum:
 *                           type: integer
 *                           example: 1
 *                         metodo:
 *                           type: object
 *                           properties:
 *                             idMetodo:
 *                               type: integer
 *                               example: 5
 *                             nombreMetodo:
 *                               type: string
 *                               example: "Método Feynman"
 *                             descripcion:
 *                               type: string
 *                               example: "Aprender explicando"
 *                         album:
 *                           type: object
 *                           properties:
 *                             idAlbum:
 *                               type: integer
 *                               example: 1
 *                             nombreAlbum:
 *                               type: string
 *                               example: "LoFi"
 *                             descripcion:
 *                               type: string
 *                               example: "Beats relajantes para estudio"
 *                             genero:
 *                               type: string
 *                               example: "LoFi"
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
 *     description: |
 *       Actualiza un evento existente perteneciente al usuario autenticado.
 *
 *       **Campos actualizables:**
 *       - Todos los campos básicos del evento
 *       - `tipoEvento`: Cambiar entre "normal" y "concentracion"
 *       - `estado`: Cambiar el estado del evento
 *       - Relaciones con métodos y álbumes
 *
 *       **Notas importantes:**
 *       - Solo el propietario del evento puede actualizarlo
 *       - Los campos no proporcionados mantienen su valor actual
 *       - Para remover un álbum, enviar `idAlbum: null`
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
 *         example: 1
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
 *                 example: "Sesión de concentración actualizada"
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *                 example: "2025-11-23"
 *               horaEvento:
 *                 type: string
 *                 description: Hora del evento (HH:MM:SS)
 *                 example: "10:00:00"
 *               descripcionEvento:
 *                 type: string
 *                 description: Descripción del evento
 *                 example: "Sesión actualizada con nuevo horario"
 *               tipoEvento:
 *                 type: string
 *                 enum: [normal, concentracion]
 *                 description: Tipo de evento
 *                 example: "concentracion"
 *               estado:
 *                 type: string
 *                 enum: [null, pendiente, completado]
 *                 description: Estado del evento
 *                 example: "pendiente"
 *               idMetodo:
 *                 type: integer
 *                 description: ID del método de estudio
 *                 example: 5
 *               idAlbum:
 *                 type: integer
 *                 description: ID del álbum de música (null para remover)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Evento actualizado correctamente
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
 *                   example: "Evento actualizado correctamente"
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Evento normal actualizado
 *                       properties:
 *                         idEvento:
 *                           type: integer
 *                           example: 1
 *                         nombreEvento:
 *                           type: string
 *                           example: "Estudio de matemáticas actualizado"
 *                         tipoEvento:
 *                           type: string
 *                           example: "normal"
 *                         estado:
 *                           type: string
 *                           example: "completado"
 *                         idMetodo:
 *                           type: integer
 *                           example: 1
 *                         idAlbum:
 *                           type: integer
 *                           example: 2
 *                     - type: object
 *                       description: Evento de concentración actualizado
 *                       properties:
 *                         idEvento:
 *                           type: integer
 *                           example: 2
 *                         nombreEvento:
 *                           type: string
 *                           example: "Sesión de concentración actualizada"
 *                         tipoEvento:
 *                           type: string
 *                           example: "concentracion"
 *                         estado:
 *                           type: string
 *                           example: "pendiente"
 *                         idMetodo:
 *                           type: integer
 *                           example: 5
 *                         idAlbum:
 *                           type: integer
 *                           example: 1
 *                         metodo:
 *                           type: object
 *                           properties:
 *                             idMetodo:
 *                               type: integer
 *                               example: 5
 *                             nombreMetodo:
 *                               type: string
 *                               example: "Método Feynman"
 *                             descripcion:
 *                               type: string
 *                               example: "Aprender explicando"
 *                         album:
 *                           type: object
 *                           properties:
 *                             idAlbum:
 *                               type: integer
 *                               example: 1
 *                             nombreAlbum:
 *                               type: string
 *                               example: "LoFi"
 *                             descripcion:
 *                               type: string
 *                               example: "Beats relajantes para estudio"
 *                             genero:
 *                               type: string
 *                               example: "LoFi"
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
 *     description: |
 *       Cambia el estado de un evento a "completado".
 *
 *       **Validaciones:**
 *       - Solo el propietario del evento puede marcarlo como completado
 *       - El evento debe existir
 *       - Equivalente a PATCH /eventos/{id} con estado: "completado"
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Evento marcado como completado exitosamente
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
 *                   example: "Evento marcado como completado"
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
 *     description: |
 *       Cambia el estado de un evento a "pendiente".
 *
 *       **Validaciones:**
 *       - Solo el propietario del evento puede marcarlo como pendiente
 *       - El evento debe existir
 *       - Equivalente a PATCH /eventos/{id} con estado: "pendiente"
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Evento marcado como pendiente exitosamente
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
 *                   example: "Evento marcado como pendiente"
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
 *     description: |
 *       Actualiza únicamente el estado de un evento existente.
 *
 *       **Estados válidos:**
 *       - `null`: Estado inicial (sin especificar)
 *       - `"pendiente"`: Evento programado pero no completado
 *       - `"completado"`: Evento finalizado exitosamente
 *
 *       **Validaciones:**
 *       - Solo el propietario del evento puede actualizarlo
 *       - El evento debe existir
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
 *         example: 1
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
 *                 enum: [null, pendiente, completado]
 *                 description: Nuevo estado del evento
 *                 example: "completado"
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
 *                   example: "Estado del evento actualizado a completado"
 *       400:
 *         description: Estado inválido o datos incorrectos
 *       404:
 *         description: Evento no encontrado
 *       401:
 *         description: No autorizado
 * */

export default router;
