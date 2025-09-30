import { Router } from 'express';
import { MetodoEstudioController } from '../controllers/MetodoEstudioController';

const router = Router();

// Ruta para obtener todos los métodos de estudio
router.get('/', MetodoEstudioController.getMetodoList)
/**
 * @swagger
 * /metodos:
 *   get:
 *     summary: Obtener todos los métodos de estudio
 *     tags: [Metodo Estudio]
 *     responses:
 *       200:
 *         description: Lista de métodos de estudio disponibles
 */

// Ruta para obtener un método de estudio por ID
router.get('/:id', MetodoEstudioController.getMetodoById)
/**
 * @swagger
 * /metodos/{id}:
 *   get:
 *     summary: Obtener un método de estudio por su ID
 *     tags: [Metodo Estudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del método de estudio
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Método de estudio con el ID especificado
 *       404:
 *         description: Método de estudio no encontrado
 */

// Ruta para obtener un método de estudio por su nombre
router.get('/nombre/:nombre', MetodoEstudioController.getMetodoByname)
/**
 * @swagger
 * /metodos/nombre/{nombre}:
 *   get:
 *     summary: Obtener un método de estudio por su nombre
 *     tags: [Metodo Estudio]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         description: Nombre del método de estudio
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Método de estudio con el nombre especificado
 *       404:
 *         description: Método de estudio no encontrado
 */

export default router;
