/**
 * Interfaz para actualizar el progreso de un método realizado
 * Define los campos disponibles para modificar el estado de progreso de un método
 */
export interface IUpdateMethodProgress {
  progreso?: number;
  finalizar?: boolean;
}