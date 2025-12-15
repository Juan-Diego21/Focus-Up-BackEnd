/**
 * Estadísticas del caché
 */
export interface ICacheStats {
  /** Claves almacenadas */
  keys: number;

  /** Hits (aciertos) */
  hits: number;

  /** Misses (fallos) */
  misses: number;

  /** Ratio de aciertos */
  ksize: number;

  /** Tamaño de valores */
  vsize: number;
}

/**
 * Configuración del caché
 */
export interface ICacheConfig {
  /** TTL estándar en segundos */
  stdTTL: number;

  /** Período de verificación en segundos */
  checkperiod: number;

  /** Usar clones de objetos */
  useClones: boolean;
}

/**
 * Interfaz para el servicio de caché
 * Define el contrato que debe implementar cualquier servicio de cache
 */
export interface ICache {
  /**
   * Obtiene un valor del caché
   * @param key Clave del caché
   * @returns Valor almacenado o undefined si no existe
   */
  get<T>(key: string): T | undefined;

  /**
   * Almacena un valor en el caché
   * @param key Clave del caché
   * @param value Valor a almacenar
   * @param ttl Tiempo de vida opcional en segundos
   * @returns true si se almacenó correctamente
   */
  set<T>(key: string, value: T, ttl?: number): boolean;

  /**
   * Elimina una clave del caché
   * @param key Clave a eliminar
   * @returns Número de claves eliminadas
   */
  del(key: string): number;

  /**
   * Verifica si una clave existe en el caché
   * @param key Clave a verificar
   * @returns true si existe
   */
  has(key: string): boolean;

  /**
   * Obtiene múltiples claves del caché
   * @param keys Array de claves
   * @returns Objeto con las claves encontradas
   */
  mget<T>(keys: string[]): { [key: string]: T };

  /**
   * Limpia completamente el caché
   */
  flushAll(): void;

  /**
   * Obtiene estadísticas del caché
   * @returns Estadísticas de uso
   */
  getStats(): ICacheStats;
}

/**
 * Constantes para claves de caché
 */
export interface ICacheKeys {
  /** Métodos de estudio */
  STUDY_METHODS: string;

  /** Roles de usuario */
  USER_ROLES: string;

  /** Configuración de la aplicación */
  APP_CONFIG: string;

  /** Configuración de método por ID */
  METHOD_CONFIG: (methodId: number) => string;

  /** Perfil de usuario por ID */
  USER_PROFILE: (userId: number) => string;
}