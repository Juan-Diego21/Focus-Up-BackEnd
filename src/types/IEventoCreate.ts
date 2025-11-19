/**
 * Interfaz para la creación de un nuevo evento
 * Define los campos requeridos y opcionales para crear un evento en la base de datos
 */
export interface IEventoCreate {
  nombreEvento: string; // Nombre del evento, obligatorio
  fechaEvento: Date; // Fecha del evento, obligatorio
  horaEvento: string; // Hora del evento, obligatorio
  descripcionEvento?: string; // Descripción opcional del evento
  idUsuario: number; // ID del usuario que crea el evento, obligatorio
  idMetodo?: number; // ID del método de estudio asociado, opcional (técnica Pomodoro puede no aplicarse)
  idAlbum?: number; // ID del álbum de música opcional
}

/**
 * Interfaz para la actualización de un evento existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface IEventoUpdate {
  nombreEvento?: string; // Nombre del evento
  fechaEvento?: Date; // Fecha del evento
  horaEvento?: string; // Hora del evento
  descripcionEvento?: string; // Descripción del evento
  idMetodo?: number; // ID del método de estudio
  idAlbum?: number; // ID del álbum de música
}