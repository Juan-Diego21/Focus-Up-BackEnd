/**
 * Interfaces para la configuración de métodos de estudio
 * Define la estructura de datos para la configuración externalizada de métodos
 */

/**
 * Configuración de un método de estudio específico
 */
export interface IStudyMethodConfig {
  /** Progresos válidos para creación inicial */
  validCreationProgress: number[];

  /** Progresos válidos para actualización */
  validUpdateProgress: number[];

  /** Progresos válidos para reanudación */
  validResumeProgress: number[];

  /** Mapeo de progreso a estado */
  statusMap: { [progress: number]: string };

  /** Procesos específicos del método (opcional) */
  processes?: string[];

  /** Estados específicos del método (opcional) */
  states?: string[];

  /** Número total de pasos (opcional) */
  totalSteps?: number;

  /** Prefijo de ruta específico (opcional) */
  routePrefix?: string;
}

/**
 * Registro completo de métodos de estudio
 */
export interface IStudyMethodRegistry {
  [methodName: string]: IStudyMethodConfig;
}

/**
 * Alias de nombres de métodos para reconocimiento flexible
 */
export interface IMethodAliases {
  [alias: string]: string;
}