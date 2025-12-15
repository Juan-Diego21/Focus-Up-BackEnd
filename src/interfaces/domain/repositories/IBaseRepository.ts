/**
 * Interfaz base para todos los repositorios
 * Define operaciones CRUD comunes que todos los repositorios deben implementar
 */
export interface IBaseRepository<T, TCreate, TUpdate> {
  /**
   * Crea una nueva entidad
   * @param entity Datos para crear la entidad
   * @returns Entidad creada
   */
  create(entity: TCreate): Promise<T>;

  /**
   * Encuentra una entidad por su ID
   * @param id ID de la entidad
   * @returns Entidad encontrada o null
   */
  findById(id: number): Promise<T | null>;

  /**
   * Actualiza una entidad existente
   * @param id ID de la entidad a actualizar
   * @param updates Datos de actualización
   * @returns Entidad actualizada o null si no existe
   */
  update(id: number, updates: TUpdate): Promise<T | null>;

  /**
   * Elimina una entidad por su ID
   * @param id ID de la entidad a eliminar
   * @returns true si se eliminó, false si no existía
   */
  delete(id: number): Promise<boolean>;

  /**
   * Obtiene todas las entidades
   * @returns Array de todas las entidades
   */
  findAll(): Promise<T[]>;
}