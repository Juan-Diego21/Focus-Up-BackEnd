import NodeCache from "node-cache";

/**
 * Capa de caché básica usando node-cache
 * Implementa caché en memoria para datos estáticos frecuentemente accedidos
 */

// Configuración del caché con TTL de 1 hora por defecto
const cache = new NodeCache({
  stdTTL: 3600, // 1 hora en segundos
  checkperiod: 600, // Verificar expiración cada 10 minutos
  useClones: false, // No clonar objetos para mejor performance
});

/**
 * Clase para manejar operaciones de caché
 */
export class CacheService {
  /**
   * Obtiene un valor del caché
   * @param key - Clave del caché
   * @returns Valor almacenado o undefined si no existe
   */
  static get<T>(key: string): T | undefined {
    return cache.get<T>(key);
  }

  /**
   * Almacena un valor en el caché
   * @param key - Clave del caché
   * @param value - Valor a almacenar
   * @param ttl - Tiempo de vida opcional en segundos
   * @returns true si se almacenó correctamente
   */
  static set<T>(key: string, value: T, ttl?: number): boolean {
    return ttl !== undefined ? cache.set(key, value, ttl) : cache.set(key, value);
  }

  /**
   * Elimina una clave del caché
   * @param key - Clave a eliminar
   * @returns Número de claves eliminadas
   */
  static del(key: string): number {
    return cache.del(key);
  }

  /**
   * Verifica si una clave existe en el caché
   * @param key - Clave a verificar
   * @returns true si existe
   */
  static has(key: string): boolean {
    return cache.has(key);
  }

  /**
   * Obtiene múltiples claves del caché
   * @param keys - Array de claves
   * @returns Objeto con las claves encontradas
   */
  static mget<T>(keys: string[]): { [key: string]: T } {
    return cache.mget<T>(keys);
  }

  /**
   * Limpia todo el caché
   */
  static flushAll(): void {
    cache.flushAll();
  }

  /**
   * Obtiene estadísticas del caché
   * @returns Estadísticas de uso
   */
  static getStats(): NodeCache.Stats {
    return cache.getStats();
  }

  /**
   * Keys específicas para diferentes tipos de datos
   */
  static readonly KEYS = {
    STUDY_METHODS: "study_methods",
    USER_ROLES: "user_roles",
    APP_CONFIG: "app_config",
    METHOD_CONFIG: (methodId: number) => `method_config_${methodId}`,
    USER_PROFILE: (userId: number) => `user_profile_${userId}`,
  } as const;
}

// Exportar instancia del caché para uso directo si es necesario
export { cache };