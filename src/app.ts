import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import routes from "./routes";
import { env } from "./config/env";
import { swaggerSpec, swaggerUi, swaggerUiOptions } from "./config/swagger";
import { initializeDatabase, AppDataSource } from "./config/ormconfig";
import logger from "./utils/logger";
import { validateEnvironment } from "./utils/envValidation";

// Validar variables de entorno al inicio
validateEnvironment();

// Crear aplicación Express
const app = express();

// ======================
// MIDDLEWARES GLOBALES
// ======================

// 1. Seguridad: Middleware Helmet - cabeceras de seguridad HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
    },
  },
  hsts: env.NODE_ENV === "production" ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false, // Deshabilitar HSTS en desarrollo
}));

// 2. CORS: Configuración restrictiva - solo permite orígenes específicos
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:8081",
        "http://localhost:5173",
        "http://localhost:3001",
        "http://127.0.0.1:3001", // También permitir 127.0.0.1
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Para desarrollo, permitir cualquier localhost origin
      if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,X-Requested-With",
    optionsSuccessStatus: 200, // Para navegadores legacy
  })
);

// 3. Logging: Registrar todas las requests
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// 4. Parsing: Habilitar parsing de JSON en requests
app.use(express.json({ limit: "10mb" }));

// 5. Parsing: Habilitar parsing de URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ======================
// RUTAS DE LA API
// ======================
app.use(env.API_PREFIX, routes);

// ======================
// DOCUMENTACIÓN SWAGGER
// ======================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Ruta para obtener la especificación Swagger en JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ======================
// MANEJO DE ERRORES GLOBAL
// ======================
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Error global:", error);

    res.status(error.status || 500).json({
      success: false,
      message: "Error interno del servidor",
      error:
        env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      timestamp: new Date(),
    });
  }
);

// ======================
// INICIAR SERVIDOR
// ======================
const PORT = env.PORT;

app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    logger.info(`🚀 Focus Up API server is running on port ${PORT}`);
    logger.info(`📍 Environment: ${env.NODE_ENV}`);
    logger.info(
      `🌐 Health check: http://localhost:${PORT}${env.API_PREFIX}/health`
    );
    logger.info(`📊 TypeORM connected: ${AppDataSource.isInitialized}`);
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
});

// Exportar app para testing
export default app;

// Force restart comment
