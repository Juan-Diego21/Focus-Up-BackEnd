import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes'; // Importar rutas principales

// Crear aplicación Express
const app = express();

// ======================
// MIDDLEWARES GLOBALES
// ======================

// 1. Seguridad: Headers de protección
app.use(helmet());

// 2. CORS: Permitir requests desde el frontend
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? 'https://tu-dominio-frontend.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// 3. Logging: Registrar todas las requests
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Parsing: Habilitar parsing de JSON en requests
app.use(express.json({ limit: '10mb' }));

// 5. Parsing: Habilitar parsing de URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ======================
// RUTAS DE LA API
// ======================
app.use(env.API_PREFIX, routes);

// ======================
// MANEJO DE ERRORES GLOBAL
// ======================
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error interno del servidor',
    error: env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    timestamp: new Date()
  });
});

// ======================
// INICIAR SERVIDOR
// ======================
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Focus Up API server is running on port ${PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}${env.API_PREFIX}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}${env.API_PREFIX}/users`);
});

// Exportar app para testing
export default app;