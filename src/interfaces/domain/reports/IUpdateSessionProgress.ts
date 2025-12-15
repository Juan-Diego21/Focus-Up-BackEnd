/**
 * Interfaz para actualizar el progreso de una sesión de concentración
 * Define los campos disponibles para modificar el estado de una sesión
 */
export interface IUpdateSessionProgress {
  status?: "completed" | "pending";
  elapsedMs?: number;
  notes?: string;
}