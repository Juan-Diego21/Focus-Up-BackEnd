import { Router } from "express";
import userRoutes from "./userRoutes";
import { env } from "../config/env";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Focus Up API is running successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: "development"
 */

// Ruta de health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Focus Up API is running successfully",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Rutas de usuarios
router.use("/users", userRoutes);

// Ruta por defecto para manejar endpoints no encontrados
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    timestamp: new Date(),
  });
});

export default router;
