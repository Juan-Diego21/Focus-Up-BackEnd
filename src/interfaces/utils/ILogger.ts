/**
 * Niveles de logging disponibles
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Interfaz para el sistema de logging
 * Define el contrato que debe implementar cualquier logger en la aplicación
 */
export interface ILogger {
  /**
   * Registra un mensaje de error
   * @param message Mensaje de error
   * @param meta Metadatos adicionales (opcional)
   */
  error(message: string, meta?: any): void;

  /**
   * Registra un mensaje de advertencia
   * @param message Mensaje de advertencia
   * @param meta Metadatos adicionales (opcional)
   */
  warn(message: string, meta?: any): void;

  /**
   * Registra un mensaje informativo
   * @param message Mensaje informativo
   * @param meta Metadatos adicionales (opcional)
   */
  info(message: string, meta?: any): void;

  /**
   * Registra un mensaje de debug
   * @param message Mensaje de debug
   * @param meta Metadatos adicionales (opcional)
   */
  debug(message: string, meta?: any): void;

  /**
   * Verifica si un nivel de log está habilitado
   * @param level Nivel de log a verificar
   * @returns true si el nivel está habilitado
   */
  isLevelEnabled(level: LogLevel): boolean;
}

/**
 * Configuración para el logger
 */
export interface ILoggerConfig {
  /** Nivel mínimo de logging */
  level: LogLevel;

  /** Nombre del servicio para identificar logs */
  serviceName: string;

  /** Directorio donde guardar archivos de log */
  logDirectory: string;

  /** Nombre del archivo para logs de error */
  errorLogFile: string;

  /** Nombre del archivo para logs combinados */
  combinedLogFile: string;

  /** Habilitar logging en consola (desarrollo) */
  enableConsole: boolean;
}