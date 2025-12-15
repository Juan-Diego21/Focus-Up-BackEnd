/**
 * Interfaz para un elemento individual de reporte
 * Representa un método realizado o sesión de concentración en los reportes
 */
export interface IReportItem {
  id_reporte: number;
  id_usuario: number;
  nombre_metodo: string;
  progreso?: number;
  estado: string;
  fecha_creacion: Date;
}