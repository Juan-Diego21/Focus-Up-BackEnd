import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { Server } from "http";
import routes from "./routes";
import { env } from "./config/env";
import { swaggerSpec, swaggerUi, swaggerUiOptions } from "./config/swagger";
import { initializeDatabase, AppDataSource } from "./config/ormconfig";
import logger from "./utils/logger";
import { HttpError } from "./utils/HttpError";

// Creamos la aplicacion Express sin efectos secundarios de arranque.
const app = express();

// ======================
// MIDDLEWARES GLOBALES
// ======================

// Seguridad HTTP mediante cabeceras recomendadas.
app.use(
  helmet({
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
    hsts:
      env.NODE_ENV === "production"
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
  })
);

// CORS estricto según entorno.
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitimos requests sin origin (apps móviles, curl, etc.).
      if (!origin) return callback(null, true);

      if (env.NODE_ENV === "development") {
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
      } else if (origin === env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,X-Requested-With",
    optionsSuccessStatus: 200,
  })
);

// Logging de requests.
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Parsing de payloads.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ======================
// RUTAS DE LA API
// ======================
app.use(env.API_PREFIX, routes);

// ======================
// DOCUMENTACIÓN SWAGGER
// ======================
if (env.NODE_ENV === "development") {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// ======================
// MANEJO GLOBAL DE ERRORES
// ======================
app.use(
  (
    error: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const isHttpError = error instanceof HttpError;
    const statusCode = isHttpError ? error.statusCode : 500;
    const message = isHttpError
      ? error.message
      : "Error interno del servidor";

    logger.error("Error global", {
      message: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
      method: req.method,
      path: req.originalUrl,
      statusCode,
    });

    res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date(),
    });
  }
);

// ======================
// INICIAR SERVIDOR
// ======================
const PORT = env.PORT;
let server: Server | null = null;
let shuttingDown = false;

/**
 * Apagado graceful del servidor HTTP y de la conexión a base de datos.
 * Ya no se gestionan cron internos aquí; toda automatización vive fuera de la API.
 */
const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`Señal ${signal} recibida, iniciando apagado graceful...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      server = null;
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    logger.info("Shutdown completado correctamente");
    process.exit(0);
  } catch (error) {
    logger.error("Error durante shutdown", { error });
    process.exit(1);
  }
};

/**
 * Inicializa recursos externos (BD) y luego abre el puerto HTTP.
 * Esto evita aceptar trafico antes de que la aplicacion este lista.
 */
export const startServer = async (): Promise<Server> => {
  if (server) {
    return server;
  }

  try {
    await initializeDatabase();
  } catch (error) {
    logger.error("No fue posible inicializar la base de datos al arrancar", {
      error,
    });
    throw error;
  }

  server = await new Promise<Server>((resolve, reject) => {
    const instance = app.listen(PORT, () => {
      logger.info(
        `El server de la API de Focus Up esta corriendo en el puerto ${PORT}`
      );
      logger.info(`Entorno: ${env.NODE_ENV}`);

      if (env.NODE_ENV === "development") {
        logger.info(
          `Verificacion de salud: http://localhost:${PORT}${env.API_PREFIX}/health`
        );
        logger.info(`Documentacion Swagger: http://localhost:${PORT}/api-docs`);
      }

      logger.info(`TypeORM conectado: ${AppDataSource.isInitialized}`);
      resolve(instance);
    });

    instance.on("error", (error) => {
      reject(error);
    });
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  return server;
};

// Exportamos app para testing.
export default app;

if (require.main === module) {
  void startServer().catch((error) => {
    logger.error("Fallo critico durante el arranque de la API", { error });
    process.exit(1);
  });
}
