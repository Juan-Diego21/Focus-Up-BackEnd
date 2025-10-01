import { Router } from "express";
import { metodoEstudioController } from "../controllers/MetodoEstudioController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MetodosEstudio
 *   description: Gestión de métodos de estudio
 */

// GET /api/v1/metodos-estudio - List all study methods
router.get("/", metodoEstudioController.getAllMetodosEstudio.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio:
 *   get:
 *     summary: Obtener todos los métodos de estudio
 *     tags: [MetodosEstudio]
 *     responses:
 *       200:
 *         description: Lista de métodos de estudio obtenida exitosamente
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
 *                   example: "Métodos de estudio obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_metodo:
 *                         type: integer
 *                         example: 1
 *                       nombre_metodo:
 *                         type: string
 *                         example: "Método Pomodoro"
 *                       descripcion:
 *                         type: string
 *                         example: "Técnica de gestión del tiempo"
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                       fecha_actualizacion:
 *                         type: string
 *                         format: date-time
 *                       beneficios:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno del servidor
 */

// GET /api/v1/metodos-estudio/:id - Get study method by ID
router.get("/:id", metodoEstudioController.getMetodoEstudioById.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id}:
 *   get:
 *     summary: Obtener método de estudio por ID
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio
 *     responses:
 *       200:
 *         description: Método de estudio encontrado
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
 *                   example: "Método de estudio encontrado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_metodo:
 *                       type: integer
 *                       example: 1
 *                     nombre_metodo:
 *                       type: string
 *                       example: "Método Pomodoro"
 *                     descripcion:
 *                       type: string
 *                       example: "Técnica de gestión del tiempo"
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *                     fecha_actualizacion:
 *                       type: string
 *                       format: date-time
 *                     beneficios:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Método de estudio no encontrado
 *       400:
 *         description: ID inválido
 */

// POST /api/v1/metodos-estudio - Create a new study method
router.post("/", metodoEstudioController.createMetodoEstudio.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio:
 *   post:
 *     summary: Crear un nuevo método de estudio
 *     tags: [MetodosEstudio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_metodo
 *             properties:
 *               nombre_metodo:
 *                 type: string
 *                 example: "Método Pomodoro"
 *               descripcion:
 *                 type: string
 *                 example: "Técnica de estudio con intervalos de tiempo"
 *     responses:
 *       201:
 *         description: Método de estudio creado exitosamente
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
 *                   example: "Método de estudio creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/MetodoEstudio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos de entrada inválidos
 */

// PUT /api/v1/metodos-estudio/:id - Update a study method
router.put("/:id", metodoEstudioController.updateMetodoEstudio.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id}:
 *   put:
 *     summary: Actualizar un método de estudio por ID
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_metodo:
 *                 type: string
 *                 example: "Método Pomodoro Avanzado"
 *               descripcion:
 *                 type: string
 *                 example: "Versión avanzada de la técnica Pomodoro"
 *     responses:
 *       200:
 *         description: Método de estudio actualizado exitosamente
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
 *                   example: "Método de estudio actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/MetodoEstudio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Método de estudio no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */

// DELETE /api/v1/metodos-estudio/:id - Delete a study method
router.delete("/:id", metodoEstudioController.deleteMetodoEstudio.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id}:
 *   delete:
 *     summary: Eliminar método de estudio por ID
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio a eliminar
 *     responses:
 *       200:
 *         description: Método de estudio eliminado correctamente
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
 *                   example: "Método de estudio eliminado correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Método de estudio no encontrado
 *       400:
 *         description: ID inválido
 */

// GET /api/v1/metodos-estudio/:id/beneficios - Get all benefits for a specific method
router.get("/:id/beneficios", metodoEstudioController.getBeneficiosForMetodo.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id}/beneficios:
 *   get:
 *     summary: Obtener todos los beneficios para un método específico
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio
 *     responses:
 *       200:
 *         description: Beneficios obtenidos exitosamente
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
 *                   example: "Beneficios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error interno del servidor
 *       400:
 *         description: ID inválido
 */

// POST /api/v1/metodos-estudio/:id_metodo/beneficios/:id_beneficio - Associate benefit with method
router.post("/:id_metodo/beneficios/:id_beneficio", metodoEstudioController.addBeneficioToMetodo.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id_metodo}/beneficios/{id_beneficio}:
 *   post:
 *     summary: Asociar beneficio con método de estudio
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id_metodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio
 *       - in: path
 *         name: id_beneficio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del beneficio
 *     responses:
 *       200:
 *         description: Beneficio asociado correctamente
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
 *                   example: "Beneficio asociado correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Asociación fallida o ya existe
 *       500:
 *         description: Error interno del servidor
 */

// DELETE /api/v1/metodos-estudio/:id_metodo/beneficios/:id_beneficio - Remove association
router.delete("/:id_metodo/beneficios/:id_beneficio", metodoEstudioController.removeBeneficioFromMetodo.bind(metodoEstudioController));

/**
 * @swagger
 * /metodos-estudio/{id_metodo}/beneficios/{id_beneficio}:
 *   delete:
 *     summary: Remover asociación entre beneficio y método de estudio
 *     tags: [MetodosEstudio]
 *     parameters:
 *       - in: path
 *         name: id_metodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del método de estudio
 *       - in: path
 *         name: id_beneficio
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del beneficio
 *     responses:
 *       200:
 *         description: Beneficio removido correctamente
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
 *                   example: "Beneficio removido correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Asociación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

export default router;