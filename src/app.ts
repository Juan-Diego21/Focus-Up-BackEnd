import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as cron from "node-cron";
import "reflect-metadata";
import routes from "./routes";
import { env } from "./config/env";
import { swaggerSpec, swaggerUi, swaggerUiOptions } from "./config/swagger";
import { initializeDatabase, AppDataSource } from "./config/ormconfig";
import logger from "./utils/logger";
import { validateEnvironment } from "./utils/envValidation";
import { PendingEmailScheduler } from "./jobs/pendingEmailScheduler";
import { SessionService } from "./services/SessionService";
import { NotificationService } from "./services/NotificationService";
import { NotificacionesProgramadasService } from "./services/NotificacionesProgramadasService";

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

      if (env.NODE_ENV === "development") {
        // Cambio productivo: en desarrollo se permiten orígenes locales para facilitar pruebas.
        const allowedDevOrigins = [
          "http://localhost:8081",
          "http://localhost:5173",
          "http://localhost:3001",
          "http://127.0.0.1:3001",
        ];

        if (allowedDevOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (
          /^http:\/\/localhost:\d+$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
        ) {
          return callback(null, true);
        }
      } else {
        // Cambio productivo: en producción solo se permite el dominio oficial del frontend (sin wildcard/regex).
        if (origin === env.FRONTEND_URL) {
          return callback(null, true);
        }
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
if (env.NODE_ENV === "development") {
  // Cambio productivo: exponer Swagger únicamente en desarrollo.
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Ruta para obtener la especificación Swagger en JSON (solo desarrollo)
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

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
    // Cambio productivo: registrar detalle interno completo, sin exponerlo al cliente.
    logger.error("Error global:", {
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
      method: req.method,
      path: req.originalUrl,
    });

    // Cambio productivo: responder siempre con mensaje genérico de error interno.
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      timestamp: new Date(),
    });
  }
);

// ======================
// INICIAR SERVIDOR
// ======================
const PORT = env.PORT;
const emailScheduler = new PendingEmailScheduler();
const cronTasks: cron.ScheduledTask[] = [];
const CRON_TIMEZONE = process.env.CRON_TIMEZONE || "America/Bogota";

const processSessionNotifications = async (): Promise<void> => {
  try {
    const sessionService = new SessionService();
    const notificationService = new NotificationService();
    const pendingSessions = await sessionService.getPendingSessionsOlderThan(7);

    for (const session of pendingSessions) {
      const scheduledAt = new Date();
      scheduledAt.setHours(9, 0, 0, 0);
      await notificationService.createScheduledNotification({
        userId: session.idUsuario,
        sessionId: session.idSesion,
        title: "Sesión de concentración pendiente",
        message: "Tienes una sesión de concentración pendiente desde hace más de una semana.",
        scheduledAt,
      });
    }
  } catch (error) {
    logger.error("Error procesando recordatorios de sesiones", { error });
  }
};

const scheduleWeeklyMotivation = async (): Promise<void> => {
  try {
    await NotificacionesProgramadasService.scheduleWeeklyMotivationalEmails();
  } catch (error) {
    logger.error("Error programando correos motivacionales semanales", { error });
  }
};
const server = app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    await emailScheduler.start();
    cronTasks.push(cron.schedule("0 2 * * *", () => void processSessionNotifications(), { timezone: CRON_TIMEZONE }));
    cronTasks.push(cron.schedule("0 9 * * 0", () => void scheduleWeeklyMotivation(), { timezone: CRON_TIMEZONE }));
    logger.info("Cron jobs de sesiones y motivación iniciados", { timezone: CRON_TIMEZONE });

    logger.info(`🚀 El server de la API de Focus Up está corriendo en el puerto ${PORT}`);
    logger.info(`📍 Entorno: ${env.NODE_ENV}`);
    // Cambio productivo: evitar URLs localhost en logs de producción.
    if (env.NODE_ENV === "development") {
      logger.info(
        `🌐 Verificación de salud: http://localhost:${PORT}${env.API_PREFIX}/health`
      );
      logger.info(
        `📄 Documentación Swagger: http://localhost:${PORT}/api-docs`
      );
    } else {
      logger.info("✅ API iniciada correctamente");
    }
    logger.info(`📊 TypeORM conectado: ${AppDataSource.isInitialized}`);
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
});

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info(`🛑 Señal ${signal} recibida, iniciando apagado graceful...`);

  try {
    await emailScheduler.stop();
    cronTasks.forEach((task) => task.stop());

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    logger.info("✅ Shutdown completado correctamente");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error durante shutdown", { error });
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

// Exportar app para testing
export default app;
