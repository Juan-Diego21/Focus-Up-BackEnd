/**
 * Interfaz para la solicitud de registro de usuario
 * Define la estructura de datos requerida para crear una nueva cuenta
 */
export interface IRegisterRequest {
  /** Nombre de usuario único */
  nombre_usuario: string;

  /** Correo electrónico único */
  correo: string;

  /** Contraseña que cumple con los requisitos de seguridad */
  contrasena: string;

  /** País de residencia (opcional) */
  pais?: string;

  /** Género del usuario (opcional) */
  genero?: "Masculino" | "Femenino" | "Otro" | "Prefiero no decir";

  /** Fecha de nacimiento (opcional) */
  fecha_nacimiento?: Date;

  /** Horario favorito de estudio (opcional) */
  horario_fav?: string;

  /** IDs de intereses del usuario (opcional) */
  intereses?: number[];

  /** IDs de distracciones del usuario (opcional) */
  distracciones?: number[];
}

/**
 * Interfaz para respuesta de registro exitoso
 */
export interface IRegisterResponse {
  /** Usuario creado (sin contraseña) */
  user: {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
    fecha_creacion: Date;
  };

  /** Mensaje de confirmación */
  message: string;
}