/**
 * Interfaz que representa una sesión de concentración en el dominio
 * Define la estructura de datos de una sesión sin dependencias de TypeORM
 */
export interface ISession {
  /** ID único de la sesión */
  idSesion: number;

  /** ID del usuario propietario de la sesión */
  idUsuario: number;

  /** Título opcional de la sesión */
  titulo?: string;

  /** Descripción opcional de la sesión */
  descripcion?: string;

  /** Estado actual de la sesión */
  estado: "pendiente" | "completada";

  /** Tipo de sesión */
  tipo: "rapid" | "scheduled";

  /** ID del evento asociado (opcional) */
  idEvento?: number;

  /** ID del método de estudio asociado (opcional) */
  idMetodo?: number;

  /** ID del álbum de música asociado (opcional) */
  idAlbum?: number;

  /** Tiempo transcurrido en formato HH:MM:SS */
  tiempoTranscurrido: string;

  /** Fecha de creación de la sesión */
  fechaCreacion: Date;

  /** Fecha de última actualización */
  fechaActualizacion: Date;

  /** Fecha y hora de la última interacción */
  ultimaInteraccion: Date;
}

/**
 * Interfaz para crear una nueva sesión
 */
export interface ICreateSession {
  titulo?: string;
  descripcion?: string;
  tipo: "rapid" | "scheduled";
  idEvento?: number;
  idMetodo?: number;
  idAlbum?: number;
  tiempoTranscurrido?: string;
}

/**
 * Interfaz para actualizar una sesión existente
 */
export interface IUpdateSession {
  titulo?: string;
  descripcion?: string;
  idMetodo?: number;
  idAlbum?: number;
}

/**
 * Interfaz para respuesta de sesión (con datos relacionados)
 */
export interface ISessionResponse extends ISession {
  /** Información adicional calculada */
  elapsedInterval?: string;
  elapsedMs?: number;
  createdAt?: string;
  updatedAt?: string;
  lastInteractionAt?: string;
}