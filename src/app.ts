import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";

// Importar rutas (las crearemos después)
// import userRoutes from './routes/userRoutes';

// Crear aplicación Express
const app = express();

// ======================
// MIDDLEWARES GLOBALES
// ======================

// 1. Seguridad: Headers de protección
app.use(helmet());

// 2. CORS: Permitir requests desde el frontend
app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? "https://tu-dominio-frontend.com"
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
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

// Ruta de salud para testing
app.get(`${env.API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Focus Up API is running successfully",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Aquí montaremos las rutas principales después
// app.use(`${env.API_PREFIX}/users`, userRoutes);

// ======================
// MANEJO DE RUTAS NO ENCONTRADAS
// ======================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ======================
// INICIAR SERVIDOR
// ======================
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Focus Up API server is running on port ${PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(
    `🌐 Health check: http://localhost:${PORT}${env.API_PREFIX}/health`
  );
});

// Exportar app para testing
export default app;
