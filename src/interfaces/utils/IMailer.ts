/**
 * Configuración para el servicio de envío de emails
 */
export interface IMailerConfig {
  /** Host del servidor SMTP */
  host: string;

  /** Puerto del servidor SMTP */
  port: number;

  /** Usar conexión segura (SSL/TLS) */
  secure: boolean;

  /** Credenciales de autenticación */
  auth: {
    user: string;
    pass: string;
  };

  /** Configuración TLS */
  tls?: {
    rejectUnauthorized?: boolean;
  };
}

/**
 * Datos para envío de email de restablecimiento de contraseña
 */
export interface IPasswordResetEmailData {
  /** Email del destinatario */
  to: string;

  /** Nombre del usuario */
  name: string;

  /** Código de verificación */
  code: string;
}

/**
 * Datos para envío de email de verificación de registro
 */
export interface IVerificationEmailData {
  /** Email del destinatario */
  to: string;

  /** Código de verificación */
  code: string;
}

/**
 * Interfaz para el servicio de envío de emails
 * Define el contrato que debe implementar cualquier servicio de mailer
 */
export interface IMailer {
  /**
   * Envía un email de restablecimiento de contraseña
   * @param data Datos del email (destinatario, nombre, código)
   * @returns Promise que se resuelve cuando el email es enviado
   * @throws Error si falla el envío
   */
  sendPasswordResetEmail(data: IPasswordResetEmailData): Promise<void>;

  /**
   * Envía un email de verificación para registro
   * @param data Datos del email (destinatario, código)
   * @returns Promise que se resuelve cuando el email es enviado
   * @throws Error si falla el envío
   */
  sendVerificationEmail(data: IVerificationEmailData): Promise<void>;

  /**
   * Verifica la configuración del servicio de email
   * @returns Promise que se resuelve si la configuración es válida
   * @throws Error si la configuración es inválida
   */
  verifyConfiguration(): Promise<void>;
}