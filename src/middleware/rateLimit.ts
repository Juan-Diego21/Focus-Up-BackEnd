import rateLimit from "express-rate-limit";

/**
 * Configuración de rate limiting para protección contra ataques de fuerza bruta
 * Rate limiting - protección contra fuerza bruta
 */

// Rate limiter para endpoints de autenticación
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por ventana
  message: {
    success: false,
    message: "Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.",
    timestamp: new Date(),
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: true, // No cuenta requests exitosos
});

// Rate limiter general para API pública
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por ventana
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intente nuevamente en unos minutos.",
    timestamp: new Date(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});