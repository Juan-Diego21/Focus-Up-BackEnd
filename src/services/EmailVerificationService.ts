import { codigosVerificacionRepository } from "../repositories/CodigosVerificacionRepository";
import { userRepository } from "../repositories/UserRepository";
import { sendVerificationEmail } from "../utils/mailer";
import { ValidationUtils } from "../utils/validation";
import logger from "../utils/logger";

/**
 * Servicio para la gestión de verificación de emails y registro de usuarios
 * Maneja códigos de verificación, validación y creación de usuarios verificados
 */
export class EmailVerificationService {
  // Constantes de configuración
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly EXPIRATION_MINUTES = 10;

  /**
   * Genera un código de verificación de 6 dígitos
   */
  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calcula la fecha de expiración del código (10 minutos desde ahora)
   */
  private static getExpirationDate(): Date {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + this.EXPIRATION_MINUTES);
    return expirationDate;
  }

  /**
   * Solicita un código de verificación para un email
   * Genera un nuevo código, lo guarda en BD y envía por email
   */
  async requestVerificationCode(email: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Validar formato del email
      if (!ValidationUtils.isValidEmail(email)) {
        return { success: false, error: "Formato de email inválido" };
      }

      // Verificar si ya existe un código activo para este email
      const existingCode = await codigosVerificacionRepository.findActiveByEmail(email);

      let verificationCode: string;
      let expirationDate: Date;

      if (existingCode) {
        // Reutilizar código existente si no ha expirado
        verificationCode = existingCode.codigo;
        expirationDate = existingCode.expiraEn;
        logger.info(`Reutilizando código de verificación existente para email: ${email}`);
      } else {
        // Generar nuevo código
        verificationCode = EmailVerificationService.generateVerificationCode();
        expirationDate = EmailVerificationService.getExpirationDate();

        // Crear entrada en la base de datos
        await codigosVerificacionRepository.createVerificationCode({
          email: email.toLowerCase(),
          codigo: verificationCode,
          expiraEn: expirationDate,
        });

        logger.info(`Nuevo código de verificación creado para email: ${email}`);
      }

      // Enviar email con el código
      await sendVerificationEmail(email, verificationCode);

      return {
        success: true,
        message: "Código de verificación enviado exitosamente"
      };

    } catch (error) {
      logger.error("Error en EmailVerificationService.requestVerificationCode:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor"
      };
    }
  }

  /**
   * Verifica un código de verificación
   * Valida el código, expiración y número de intentos
   */
  async verifyCode(email: string, codigo: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Validar formato del email
      if (!ValidationUtils.isValidEmail(email)) {
        return { success: false, error: "Formato de email inválido" };
      }

      // Buscar código activo para este email
      const verificationCode = await codigosVerificacionRepository.findActiveByEmail(email);

      if (!verificationCode) {
        return { success: false, error: "No se encontró un código de verificación activo para este email" };
      }

      // Verificar si el código ha expirado
      if (codigosVerificacionRepository.isCodeExpired(verificationCode.expiraEn)) {
        return { success: false, error: "El código de verificación ha expirado" };
      }

      // Verificar número máximo de intentos
      if (verificationCode.intentos >= EmailVerificationService.MAX_ATTEMPTS) {
        return { success: false, error: "Se ha excedido el número máximo de intentos" };
      }

      // Verificar si el código coincide
      if (verificationCode.codigo !== codigo) {
        // Incrementar contador de intentos
        await codigosVerificacionRepository.incrementAttempts(verificationCode.id!);
        const remainingAttempts = EmailVerificationService.MAX_ATTEMPTS - verificationCode.intentos - 1;

        return {
          success: false,
          error: `Código incorrecto. Intentos restantes: ${remainingAttempts}`
        };
      }

      // Código válido
      return {
        success: true,
        message: "Email verificado exitosamente"
      };

    } catch (error) {
      logger.error("Error en EmailVerificationService.verifyCode:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor"
      };
    }
  }

  /**
   * Registra un nuevo usuario después de verificar el email
   * Requiere que el email haya sido verificado previamente
   */
  async registerUser(email: string, username: string, password: string): Promise<{
    success: boolean;
    user?: any;
    message?: string;
    error?: string;
  }> {
    try {
      // Validar formato del email
      if (!ValidationUtils.isValidEmail(email)) {
        return { success: false, error: "Formato de email inválido" };
      }

      // Verificar que el email esté verificado (tiene código válido no expirado)
      const verificationCode = await codigosVerificacionRepository.findActiveByEmail(email);

      if (!verificationCode) {
        return { success: false, error: "El email no ha sido verificado" };
      }

      if (codigosVerificacionRepository.isCodeExpired(verificationCode.expiraEn)) {
        return { success: false, error: "La verificación del email ha expirado" };
      }

      // Validar datos del usuario
      if (!ValidationUtils.isValidUsername(username)) {
        return {
          success: false,
          error: "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"
        };
      }

      if (!ValidationUtils.isValidPassword(password)) {
        return {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
        };
      }

      // Verificar que el email no esté ya registrado
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return { success: false, error: "El email ya está registrado" };
      }

      // Verificar que el username no esté ya registrado
      const existingUsername = await userRepository.findByUsername(username);
      if (existingUsername) {
        return { success: false, error: "El nombre de usuario ya está en uso" };
      }

      // Hash de la contraseña
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"));

      // Crear el usuario
      const newUser = await userRepository.create({
        nombre_usuario: ValidationUtils.sanitizeText(username),
        correo: email.toLowerCase().trim(),
        contrasena: hashedPassword,
      });

      // Eliminar todos los códigos de verificación para este email
      await codigosVerificacionRepository.deleteByEmail(email);

      logger.info(`Usuario registrado exitosamente: ${username} (${email})`);

      return {
        success: true,
        user: newUser,
        message: "Usuario registrado exitosamente"
      };

    } catch (error) {
      logger.error("Error en EmailVerificationService.registerUser:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor"
      };
    }
  }

  /**
   * Limpia códigos de verificación expirados
   * Llama al método del repositorio para eliminar códigos expirados
   */
  async cleanupExpiredCodes(): Promise<{
    success: boolean;
    deletedCount?: number;
    message?: string;
    error?: string;
  }> {
    try {
      const deletedCount = await codigosVerificacionRepository.cleanupExpiredCodes();

      logger.info(`Códigos expirados eliminados: ${deletedCount}`);

      return {
        success: true,
        deletedCount,
        message: `Se eliminaron ${deletedCount} códigos expirados`
      };

    } catch (error) {
      logger.error("Error en EmailVerificationService.cleanupExpiredCodes:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error interno del servidor"
      };
    }
  }
}

// Exportar instancia del servicio
export const emailVerificationService = new EmailVerificationService();