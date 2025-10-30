import { Router } from "express";
import { beneficioController } from "../controllers/BeneficioController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Beneficios
 *   description: Gestión de beneficios
 */

// GET /api/v1/beneficios - List all benefits
router.get("/", authenticateToken, beneficioController.getAllBeneficios.bind(beneficioController));

/**
 * @swagger
 * /beneficios:
 *   get:
 *     summary: Obtener todos los beneficios
 *     tags: [Beneficios]
 *     responses:
 *       200:
 *         description: Lista de beneficios obtenida exitosamente
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
 */

// GET /api/v1/beneficios/:id - Get benefit by ID
router.get("/:id", authenticateToken, beneficioController.getBeneficioById.bind(beneficioController));

/**
 * @swagger
 * /beneficios/{id}:
 *   get:
 *     summary: Obtener beneficio por ID
 *     tags: [Beneficios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del beneficio
 *     responses:
 *       200:
 *         description: Beneficio encontrado
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
 *                   example: "Beneficio encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Beneficio no encontrado
 *       400:
 *         description: ID inválido
 */

// POST /api/v1/beneficios - Create a new benefit
router.post("/", authenticateToken, beneficioController.createBeneficio.bind(beneficioController));

/**
 * @swagger
 * /beneficios:
 *   post:
 *     summary: Crear un nuevo beneficio
 *     tags: [Beneficios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descripcion_beneficio
 *             properties:
 *               descripcion_beneficio:
 *                 type: string
 *                 example: "Mejora la concentración"
 *     responses:
 *       201:
 *         description: Beneficio creado exitosamente
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
 *                   example: "Beneficio creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos de entrada inválidos
 */

// PUT /api/v1/beneficios/:id - Update a benefit
router.put("/:id", authenticateToken, beneficioController.updateBeneficio.bind(beneficioController));

/**
 * @swagger
 * /beneficios/{id}:
 *   put:
 *     summary: Actualizar un beneficio por ID
 *     tags: [Beneficios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del beneficio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion_beneficio:
 *                 type: string
 *                 example: "Mejora significativamente la concentración"
 *     responses:
 *       200:
 *         description: Beneficio actualizado exitosamente
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
 *                   example: "Beneficio actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Beneficio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Beneficio no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */

// DELETE /api/v1/beneficios/:id - Delete a benefit
router.delete("/:id", authenticateToken, beneficioController.deleteBeneficio.bind(beneficioController));

/**
 * @swagger
 * /beneficios/{id}:
 *   delete:
 *     summary: Eliminar beneficio por ID
 *     tags: [Beneficios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del beneficio a eliminar
 *     responses:
 *       200:
 *         description: Beneficio eliminado correctamente
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
 *                   example: "Beneficio eliminado correctamente"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Beneficio no encontrado
 *       400:
 *         description: ID inválido
 */

export default router;