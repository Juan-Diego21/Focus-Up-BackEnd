/**
 * Interfaz para la solicitud de login
 * Define la estructura de datos que se espera en el endpoint de login
 */
export interface ILoginRequest {
  /** Email del usuario o nombre de usuario */
  identifier: string;

  /** Contraseña en texto plano */
  password: string;
}

/**
 * Interfaz para respuesta de login exitoso
 */
export interface ILoginResponse {
  /** Usuario autenticado (sin contraseña) */
  user: {
    id_usuario: number;
    nombre_usuario: string;
    correo: string;
  };

  /** Token JWT de acceso */
  token: string;

  /** Token JWT de refresco (opcional) */
  refreshToken?: string;
}