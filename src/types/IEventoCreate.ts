/**
 * Interfaz para la creación de un nuevo evento
 * Define los campos requeridos y opcionales para crear un evento en la base de datos
 */
export interface IEventoCreate {
  nombreEvento: string; // Nombre del evento, obligatorio
  fechaEvento: string; // Fecha del evento en formato YYYY-MM-DD, obligatorio
  horaEvento: string; // Hora del evento, obligatorio
  descripcionEvento?: string; // Descripción opcional del evento
  idUsuario: number; // ID del usuario que crea el evento, obligatorio
  idMetodo?: number; // ID del método de estudio asociado, opcional (técnica Pomodoro puede no aplicarse)
  idAlbum?: number; // ID del álbum de música opcional
  estado?: 'pending' | 'completed' | null; // Estado opcional del evento, por defecto null
}

/**
 * Interfaz para la actualización de un evento existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export interface IEventoUpdate {
  nombreEvento?: string; // Nombre del evento
  fechaEvento?: string; // Fecha del evento en formato YYYY-MM-DD
  horaEvento?: string; // Hora del evento
  descripcionEvento?: string; // Descripción del evento
  idMetodo?: number; // ID del método de estudio
  idAlbum?: number; // ID del álbum de música
  estado?: 'pending' | 'completed' | null; // Estado opcional del evento
}