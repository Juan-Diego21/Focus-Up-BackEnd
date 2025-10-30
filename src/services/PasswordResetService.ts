import { PasswordResetEntity } from "../models/PasswordReset.entity";
import { UserEntity } from "../models/User.entity";
import { AppDataSource } from "../config/ormconfig";
import { sendResetEmail } from "../utils/mailer";
import { ValidationUtils } from "../utils/validation";
import logger from "../utils/logger";

export class PasswordResetService {
  private passwordResetRepository = AppDataSource.getRepository(PasswordResetEntity);
  private userRepository = AppDataSource.getRepository(UserEntity);

  // Solicitar restablecimiento de contraseña
  async requestPasswordReset(emailOrUsername: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validar entrada
      if (!emailOrUsername) {
        logger.warn("requestPasswordReset: emailOrUsername está vacío");
        return { success: false, message: "El correo electrónico o nombre de usuario es requerido." };
      }

      logger.info(`requestPasswordReset: Buscando usuario con identificador: ${emailOrUsername}`);

      // Buscar usuario por email o username usando OR condition
      const user = await this.userRepository.findOne({
        where: [
          { correo: emailOrUsername.toLowerCase() },
          { nombreUsuario: emailOrUsername }
        ]
      });

      logger.info(`requestPasswordReset: Resultado de búsqueda de usuario: ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
      if (user) {
        logger.info(`requestPasswordReset: Usuario encontrado - ID: ${user.idUsuario}, Email: ${user.correo}, Username: ${user.nombreUsuario}`);
      }

      // Mensaje genérico por seguridad
      if (!user) {
        logger.info(`Intento de restablecimiento para identificador no registrado: ${emailOrUsername}`);
        return { success: true, message: "Si el correo o nombre de usuario existe, recibirás un código para restablecer tu contraseña." };
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Calcular expiración (10 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Hash del código para almacenamiento seguro
      const bcrypt = await import("bcryptjs");
      const hashedCode = await bcrypt.hash(code, 12);

      logger.info(`requestPasswordReset: Generando código de verificación para usuario ${user.idUsuario}`);

      // Crear registro en la base de datos
      const passwordReset = this.passwordResetRepository.create({
        userId: user.idUsuario,
        code: hashedCode,
        expiresAt,
        used: false,
      });

      logger.info(`requestPasswordReset: Guardando registro de reset en base de datos`);
      await this.passwordResetRepository.save(passwordReset);
      logger.info(`requestPasswordReset: Registro guardado exitosamente`);

      // Enviar email
      logger.info(`requestPasswordReset: Enviando email a ${user.correo} con código ${code}`);
      await sendResetEmail(user.correo, user.nombreUsuario, code);
      logger.info(`requestPasswordReset: Email enviado exitosamente`);

      logger.info(`Código de restablecimiento enviado a: ${user.correo}`);
      return { success: true, message: "Si el correo o nombre de usuario existe, recibirás un código para restablecer tu contraseña." };

    } catch (error: any) {
      logger.error("Error en requestPasswordReset:", error);
      logger.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return { success: false, message: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente." };
    }
  }

  // Verificar código y restablecer contraseña
  async verifyResetCodeAndResetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar entrada
      if (!email || !ValidationUtils.isValidEmail(email)) {
        return { success: false, message: "El correo electrónico es requerido." };
      }

      if (!code || code.length !== 6) {
        return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
      }

      if (!newPassword || !ValidationUtils.isValidPassword(newPassword)) {
        return { success: false, message: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número." };
      }

      // Buscar usuario
      const user = await this.userRepository.findOne({ where: { correo: email.toLowerCase() } });
      if (!user) {
        return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
      }

      // Buscar el código de restablecimiento más reciente no usado
      const passwordReset = await this.passwordResetRepository.findOne({
        where: {
          userId: user.idUsuario,
          used: false,
        },
        order: { createdAt: "DESC" },
      });

      if (!passwordReset) {
        return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
      }

      // Verificar expiración
      if (new Date() > passwordReset.expiresAt) {
        return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
      }

      // Verificar código
      const bcrypt = await import("bcryptjs");
      const isValidCode = await bcrypt.compare(code, passwordReset.code);
      if (!isValidCode) {
        return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
      }

      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña del usuario
      await this.userRepository.update(user.idUsuario, { contrasena: hashedPassword });

      // Marcar código como usado
      await this.passwordResetRepository.update(passwordReset.id, { used: true });

      logger.info(`Contraseña restablecida exitosamente para usuario: ${user.correo}`);
      return { success: true, message: "Tu contraseña ha sido restablecida exitosamente." };

    } catch (error: any) {
      logger.error("Error en verifyResetCodeAndResetPassword:", error);
      return { success: false, message: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente." };
    }
  }
}

export const passwordResetService = new PasswordResetService();