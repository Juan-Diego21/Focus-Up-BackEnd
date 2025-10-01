import { Router } from 'express';
import { eventosController } from '../controllers/EventoController';

const router = Router();

// Listar eventos
router.get('/', eventosController.listEventos.bind(eventosController));
/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Listar todos los eventos registrados
 *     tags: [Eventos]
 *     responses:
 *       200:
 *         description: Lista de eventos disponibles
 */

// Crear evento
router.post('/crear', eventosController.crearEvento.bind(eventosController));
/**
 * @swagger
 * /eventos/crear:
 *   post:
 *     summary: Crear un nuevo evento
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreEvento:
 *                 type: string
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *               horaEvento:
 *                 type: string
 *               descripcionEvento:
 *                 type: string
 *               idMetodo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       400:
 *         description: Datos inválidos o método de estudio no válido
 */

// Actualizar evento
router.put('/:id', eventosController.updateEvento.bind(eventosController));
/**
 * @swagger
 * /eventos/{id}:
 *   put:
 *     summary: Actualizar un evento existente
 *     tags: [Eventos]
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
 *               fechaEvento:
 *                 type: string
 *                 format: date
 *               horaEvento:
 *                 type: string
 *               descripcionEvento:
 *                 type: string
 *               idMetodo:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Evento actualizado correctamente
 *       404:
 *         description: Evento no encontrado
 */

// Eliminar evento
router.delete('/:id', eventosController.deleteEvento.bind(eventosController));
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
