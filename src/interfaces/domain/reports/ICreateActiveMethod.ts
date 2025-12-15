/**
 * Interfaz para crear un nuevo método activo
 * Define los campos requeridos para inicializar un método de estudio activo
 */
export interface ICreateActiveMethod {
  idMetodo: number;
  estado?: string;
  progreso?: number;
  idUsuario: number;
}