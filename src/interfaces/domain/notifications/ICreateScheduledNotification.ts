/**
 * Interfaz para crear una notificación programada
 * Define los campos requeridos para programar una nueva notificación
 */
export interface ICreateScheduledNotification {
  idUsuario: number;
  tipo: string;
  titulo?: string;
  mensaje?: string;
  fechaProgramada: Date;
}