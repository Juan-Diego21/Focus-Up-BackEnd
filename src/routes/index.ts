import { Router } from "express";
import userRoutes from "./userRoutes";
import musicaRoutes from "./musicaRoutes";
import beneficioRoutes from "./beneficioRoutes";
import metodoEstudioRoutes from "./metodoEstudioRoutes";
import { env } from "../config/env";
import eventosRutas from "../routes/eventosRutas"

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

// Rutas de beneficios
router.use("/beneficios", beneficioRoutes);

// Rutas de métodos de estudio
router.use("/metodos-estudio", metodoEstudioRoutes);

//Rutas de Eventos
router.use("/eventos", eventosRutas)

// Rutas de musica
router.use("/musica", musicaRoutes);

// Ruta por defecto para manejar endpoints no encontrados
router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    timestamp: new Date(),
  });
});

export default router;
