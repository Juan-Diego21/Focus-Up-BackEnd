import { UserCreateInput, UserUpdateInput, User } from "../types/User";
import { userRepository } from "../repositories/UserRepository";
import { ValidationUtils } from "../utils/validation";
import { UsuarioInteresesEntity } from "../models/UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "../models/UsuarioDistracciones.entity";
import { UserEntity } from "../models/User.entity";
import logger from "../utils/logger";
import { JwtUtils } from "../utils/jwt";
import nodemailer from "nodemailer";

/**
 * Servicio para la gestión completa de usuarios
 * Maneja autenticación, registro, actualización y recuperación de contraseña
 */
export class UserService {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.BCRYPT_SALT_ROUNDS || "12"
  );

  /**
   * Genera un hash seguro de la contraseña usando bcrypt
   * Utiliza el número de rondas configurado en las variables de entorno
   */
  private static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verifica si una contraseña en texto plano coincide con su hash
   * Incluye manejo de errores para contraseñas no hasheadas (retrocompatibilidad)
   */
  private static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Crea un nuevo usuario en el sistema con validaciones completas
   * Incluye verificación de unicidad, hash de contraseña y asociaciones con intereses/distracciones
   */
  async createUser(userData: UserCreateInput): Promise<{
    success: boolean;
    user?: User;
    message?: string;
    error?: string;
  }> {
    const queryRunner = (
      await import("../config/ormconfig")
    ).AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validaciones
      if (!ValidationUtils.isValidUsername(userData.nombre_usuario)) {
        return {
          success: false,
          error:
            "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios",
        };
      }

      if (!ValidationUtils.isValidEmail(userData.correo)) {
        return { success: false, error: "Formato de email inválido" };
      }

      if (!ValidationUtils.isValidPassword(userData.contrasena)) {
        return {
          success: false,
          error:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
        };
      }

      if (
        userData.horario_fav &&
        !ValidationUtils.isValidTime(userData.horario_fav)
      ) {
        return {
          success: false,
          error: "Formato de hora inválido (use HH:MM)",
        };
      }

      // Sanitizar entradas
      const sanitizedData: UserCreateInput = {
        ...userData,
        nombre_usuario: ValidationUtils.sanitizeText(userData.nombre_usuario),
        pais: userData.pais
          ? ValidationUtils.sanitizeText(userData.pais)
          : undefined,
        correo: userData.correo.toLowerCase().trim(),
      };

      // Verificar si el email ya existe
      const emailExists =
        (await queryRunner.manager
          .createQueryBuilder()
          .select()
          .from("usuario", "u")
          .where("u.correo = :email", { email: sanitizedData.correo })
          .getCount()) > 0;

      if (emailExists) {
        return {
          success: false,
          message: "Validation error",
          error: "El correo ya existe",
        };
      }

      // Verificar si el nombre de usuario ya existe
      const usernameExists =
        (await queryRunner.manager
          .createQueryBuilder()
          .select()
          .from("usuario", "u")
          .where("u.nombre_usuario = :username", {
            username: sanitizedData.nombre_usuario,
          })
          .getCount()) > 0;

      if (usernameExists) {
        return {
          success: false,
          message: "Validation error",
          error: "El nombre de usuario ya existe",
        };
      }

      // Hash de la contraseña ANTES de crear el usuario
      const hashedPassword = await UserService.hashPassword(
        sanitizedData.contrasena
      );

      // Crear usuario con contraseña hasheada usando el queryRunner
      const user = (await queryRunner.manager.save(UserEntity, {
        nombreUsuario: sanitizedData.nombre_usuario,
        pais: sanitizedData.pais,
        genero: sanitizedData.genero,
        fechaNacimiento: sanitizedData.fecha_nacimiento || undefined,
        horarioFav: sanitizedData.horario_fav,
        correo: sanitizedData.correo.toLowerCase(),
        contrasena: hashedPassword,
      })) as UserEntity;

      // Insertar intereses si se proporcionaron
      if (userData.intereses && userData.intereses.length > 0) {
        await this.insertUserInterestsInTransaction(
          queryRunner,
          user.idUsuario,
          userData.intereses
        );
      }

      // Insertar distracciones si se proporcionaron
      if (userData.distracciones && userData.distracciones.length > 0) {
        await this.insertUserDistractionsInTransaction(
          queryRunner,
          user.idUsuario,
          userData.distracciones
        );
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        user: {
          id_usuario: user.idUsuario,
          nombre_usuario: user.nombreUsuario,
          pais: user.pais,
          genero: user.genero as any,
          fecha_nacimiento: user.fechaNacimiento,
          horario_fav: user.horarioFav,
          correo: user.correo,
          contrasena: user.contrasena,
          fecha_creacion: user.fechaCreacion,
          fecha_actualizacion: user.fechaActualizacion,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error("Error en UserService.createUser:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene un usuario específico por su ID único
   * Retorna null si el usuario no existe
   */
  async getUserById(
    id: number
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        return { success: false, error: "Usuario no encontrado" };
      }
      return { success: true, user };
    } catch (error) {
      logger.error("Error en UserService.getUserById:", error);
      return { success: false, error: "Error al obtener usuario" };
    }
  }

  /**
   * Obtiene un usuario específico por su dirección de correo electrónico
   * Utilizado principalmente para validaciones de unicidad
   */
  async getUserByEmail(
    email: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return { success: false, error: "Usuario no encontrado" };
      }
      return { success: true, user };
    } catch (error) {
      logger.error("Error en UserService.getUserByEmail:", error);
      return { success: false, error: "Error al obtener usuario" };
    }
  }

  /**
   * Actualiza la información de un usuario existente
   * Incluye validaciones de unicidad para email y nombre de usuario
   */
  async updateUser(
    id: number,
    updateData: UserUpdateInput
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Si se actualiza la contraseña, hacer hash
      if (updateData.contrasena) {
        if (!ValidationUtils.isValidPassword(updateData.contrasena)) {
          return {
            success: false,
            error:
              "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
          };
        }
        updateData.contrasena = await UserService.hashPassword(
          updateData.contrasena
        );
      }

      // Validaciones adicionales
      if (
        updateData.correo &&
        !ValidationUtils.isValidEmail(updateData.correo)
      ) {
        return { success: false, error: "Formato de email inválido" };
      }

      if (
        updateData.horario_fav &&
        !ValidationUtils.isValidTime(updateData.horario_fav)
      ) {
        return {
          success: false,
          error: "Formato de hora inválido (use HH:MM)",
        };
      }

      // Sanitizar entradas
      const sanitizedData: UserUpdateInput = { ...updateData };
      if (sanitizedData.nombre_usuario) {
        sanitizedData.nombre_usuario = ValidationUtils.sanitizeText(
          sanitizedData.nombre_usuario
        );
      }
      if (sanitizedData.pais) {
        sanitizedData.pais = ValidationUtils.sanitizeText(sanitizedData.pais);
      }
      if (sanitizedData.correo) {
        sanitizedData.correo = sanitizedData.correo.toLowerCase().trim();
      }

      // Verificar unicidad si se actualiza email
      if (sanitizedData.correo) {
        const emailExists = await userRepository.emailExists(
          sanitizedData.correo,
          id
        );
        if (emailExists) {
          return {
            success: false,
            error: "El correo electrónico ya está registrado",
          };
        }
      }

      // Verificar unicidad si se actualiza nombre de usuario
      if (sanitizedData.nombre_usuario) {
        const usernameExists = await userRepository.usernameExists(
          sanitizedData.nombre_usuario,
          id
        );
        if (usernameExists) {
          return {
            success: false,
            error: "El nombre de usuario ya está en uso",
          };
        }
      }

      const user = await userRepository.update(id, sanitizedData);
      if (!user) {
        return { success: false, error: "Usuario no encontrado" };
      }

      return { success: true, user };
    } catch (error) {
      logger.error("Error en UserService.updateUser:", error);
      return { success: false, error: "Error al actualizar usuario" };
    }
  }

  /**
   * Verifica las credenciales de login de un usuario
   * Acepta tanto email como nombre de usuario como identificador
   * Incluye compatibilidad con contraseñas no hasheadas por retrocompatibilidad
   */
  async verifyCredentials(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Intentar encontrar por email primero
      let user = await userRepository.findByEmail(identifier);

      // Si no se encuentra por email, intentar por username
      if (!user) {
        user = await userRepository.findByUsername(identifier);
      }

      if (!user) {
        return { success: false, error: "Credenciales inválidas" };
      }

      // Verificar contraseña
      let isValidPassword: boolean;
      try {
        isValidPassword = await UserService.verifyPassword(
          password,
          user.contrasena
        );
      } catch (error) {
        // Si bcrypt falla (posiblemente contraseña no hasheada), comparar directamente
        isValidPassword = password === user.contrasena;
      }
      if (!isValidPassword) {
        return { success: false, error: "Credenciales inválidas" };
      }

      // No devolver la contraseña en el objeto user
      const { contrasena: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      logger.error("Error en UserService.verifyCredentials:", error);
      return { success: false, error: "Error al verificar credenciales" };
    }
  }

  /**
   * Obtiene lista completa de todos los usuarios del sistema
   * Método destinado únicamente para funcionalidades administrativas
   */
  async getAllUsers(): Promise<{
    success: boolean;
    users?: User[];
    error?: string;
  }> {
    try {
      const users = await userRepository.findAll();
      return { success: true, users };
    } catch (error) {
      logger.error("Error en UserService.getAllUsers:", error);
      return { success: false, error: "Error al obtener usuarios" };
    }
  }

  /**
   * Inserta los intereses asociados a un usuario
   * Método auxiliar para la creación de usuarios con intereses
   */
  private async insertUserInterests(
    userId: number,
    interestIds: number[]
  ): Promise<void> {
    const { AppDataSource } = await import("../config/ormconfig");
    const usuarioInteresesRepo = AppDataSource.getRepository(
      UsuarioInteresesEntity
    );

    const inserts = interestIds.map((interestId) => ({
      usuario: { idUsuario: userId },
      interes: { idInteres: interestId },
    }));

    await usuarioInteresesRepo.save(inserts);
  }

  /**
   * Inserta las distracciones asociadas a un usuario
   * Método auxiliar para la creación de usuarios con distracciones
   */
  private async insertUserDistractions(
    userId: number,
    distractionIds: number[]
  ): Promise<void> {
    const { AppDataSource } = await import("../config/ormconfig");
    const usuarioDistraccionesRepo = AppDataSource.getRepository(
      UsuarioDistraccionesEntity
    );

    const inserts = distractionIds.map((distractionId) => ({
      usuario: { idUsuario: userId },
      distraccion: { idDistraccion: distractionId },
    }));

    await usuarioDistraccionesRepo.save(inserts);
  }

  /**
   * Inserta los intereses del usuario dentro de una transacción de base de datos
   * Garantiza atomicidad en la creación de usuarios con intereses asociados
   */
  private async insertUserInterestsInTransaction(
    queryRunner: any,
    userId: number,
    interestIds: number[]
  ): Promise<void> {
    const inserts = interestIds.map((interestId) => ({
      idUsuario: userId,
      idInteres: interestId,
    }));

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into("usuariointereses")
      .values(inserts)
      .execute();
  }

  /**
   * Inserta las distracciones del usuario dentro de una transacción de base de datos
   * Garantiza atomicidad en la creación de usuarios con distracciones asociadas
   */
  private async insertUserDistractionsInTransaction(
    queryRunner: any,
    userId: number,
    distractionIds: number[]
  ): Promise<void> {
    const inserts = distractionIds.map((distractionId) => ({
      idUsuario: userId,
      idDistraccion: distractionId,
    }));

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into("usuariodistracciones")
      .values(inserts)
      .execute();
  }

  /**
   * Elimina un usuario del sistema por su ID
   * Operación destructiva que requiere validación previa
   */
  async deleteUser(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const deleted = await userRepository.delete(id);
      if (!deleted) {
        return { success: false, error: "Usuario no encontrado" };
      }
      return { success: true };
    } catch (error) {
      console.error("Error en UserService.deleteUser:", error);
      return { success: false, error: "Error eliminando usuario" };
    }
  }
  /**
   * Envía un enlace de restablecimiento de contraseña al usuario
   * Busca por email o nombre de usuario y envía código de verificación por email
   */
  async sendPasswordResetLink(emailOrUsername: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Buscar usuario por email o username
    let user = await userRepository.findByEmail(emailOrUsername);

    if (!user) {
      user = await userRepository.findByUsername(emailOrUsername);
    }

    // Mensaje genérico por seguridad
    if (!user) {
      return {
        success: true,
        message: "Si el usuario existe, recibirás un enlace para restablecer tu contraseña."
      };
    }

    // Generar token
    const tokenPayload = {
      userId: user.id_usuario!,
      email: user.correo,
    };

    const resetToken = JwtUtils.generateAccessToken(tokenPayload);

    // Crear enlace
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Enviar email
    await this.sendResetEmail(user.correo, resetLink, user.nombre_usuario);

    return {
      success: true,
      message: "Se ha enviado un enlace de restablecimiento a tu email."
    };

  } catch (error) {
    logger.error("Error en sendPasswordResetLink:", error);

    // Por seguridad, siempre retornar éxito
    return {
      success: true,
      message: "Si el usuario existe, recibirás un enlace para restablecer tu contraseña."
    };
  }
}

  /**
   * Restablece la contraseña de un usuario usando un token JWT
   * Valida el token y actualiza la contraseña hasheada en la base de datos
   */
  async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Verificar token
      const decoded = JwtUtils.verifyAccessToken(token);

      // Validar nueva contraseña
      if (!ValidationUtils.isValidPassword(newPassword)) {
        return {
          success: false,
          message: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
        };
      }

      // Hash nueva contraseña
      const hashedPassword = await UserService.hashPassword(newPassword);

      const update  = await userRepository.updatePassword(decoded.userId, hashedPassword);
      
      if (!update) {
        return {
          success: false,
          message: "Usuario no encontrado"
        };
      }

      return {
        success: true,
        message: "Contraseña restablecida exitosamente"
      };

    } catch (error) {
      logger.error("Error en UserService.resetPassword:", error);
      
      return {
        success: false,
        message: "Token inválido o expirado"
      };
    }
  }

  /**
   * Envía el email de restablecimiento de contraseña
   * Utiliza el servicio de email configurado para enviar el enlace de recuperación
   */
  private async sendResetEmail(email: string, resetLink: string, username: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASS!,
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER!,
        to: email,
        subject: "Restablecer tu contraseña",
        html: `
          <h2>Hola ${username}</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 15 minutos.</p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Email de restablecimiento enviado a: ${email}`);

    } catch (error) {
      logger.error("Error enviando email de restablecimiento:", error);
      throw error;
    }
  }

}

export const userService = new UserService();
