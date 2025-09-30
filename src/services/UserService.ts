import { UserCreateInput, UserUpdateInput, User } from "../types/User";
import { userRepository } from "../repositories/UserRepository";
import { ValidationUtils } from "../utils/validation";
import { UserModel } from "../models/User";
import { UsuarioInteresesEntity } from "../models/UsuarioIntereses.entity";
import { UsuarioDistraccionesEntity } from "../models/UsuarioDistracciones.entity";
import { UserEntity } from "../models/User.entity";
import logger from "../utils/logger";

export class UserService {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.BCRYPT_SALT_ROUNDS || "12"
  );

  // Hash de contraseña
  private static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verificar contraseña
  private static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Crear un nuevo usuario con validaciones
  async createUser(
    userData: UserCreateInput
  ): Promise<{ success: boolean; user?: User; message?: string; error?: string }> {
    const queryRunner = (await import("../config/ormconfig")).AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validaciones
      if (!ValidationUtils.isValidUsername(userData.nombre_usuario)) {
        return {
          success: false,
          error: "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"
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
      const emailExists = await queryRunner.manager
        .createQueryBuilder()
        .select()
        .from("usuario", "u")
        .where("u.correo = :email", { email: sanitizedData.correo })
        .getCount() > 0;

      if (emailExists) {
        return {
          success: false,
          message: "Validation error",
          error: "El correo ya existe",
        };
      }

      // Verificar si el nombre de usuario ya existe
      const usernameExists = await queryRunner.manager
        .createQueryBuilder()
        .select()
        .from("usuario", "u")
        .where("u.nombre_usuario = :username", { username: sanitizedData.nombre_usuario })
        .getCount() > 0;

      if (usernameExists) {
        return {
          success: false,
          message: "Validation error",
          error: "El nombre de usuario ya existe"
        };
      }

      // Hash de la contraseña ANTES de crear el usuario
      const hashedPassword = await UserService.hashPassword(
        sanitizedData.contrasena
      );

      // Crear usuario con contraseña hasheada usando el queryRunner
      const user = await queryRunner.manager.save(UserEntity, {
        nombreUsuario: sanitizedData.nombre_usuario,
        pais: sanitizedData.pais,
        genero: sanitizedData.genero,
        fechaNacimiento: sanitizedData.fecha_nacimiento || undefined,
        horarioFav: sanitizedData.horario_fav,
        correo: sanitizedData.correo.toLowerCase(),
        contrasena: hashedPassword,
      }) as UserEntity;

      // Insertar intereses si se proporcionaron
      if (userData.intereses && userData.intereses.length > 0) {
        await this.insertUserInterestsInTransaction(queryRunner, user.idUsuario, userData.intereses);
      }

      // Insertar distracciones si se proporcionaron
      if (userData.distracciones && userData.distracciones.length > 0) {
        await this.insertUserDistractionsInTransaction(queryRunner, user.idUsuario, userData.distracciones);
      }

      await queryRunner.commitTransaction();

      return { success: true, user: {
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
      } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error("Error en UserService.createUser:", { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      };
    } finally {
      await queryRunner.release();
    }
  }

  // Obtener usuario por ID
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

  // Obtener usuario por email
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

  // Actualizar usuario
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

  // Verificar credenciales de login (acepta email o username)
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

      // Verificar contraseña hasheada
      const isValidPassword = await UserService.verifyPassword(
        password,
        user.contrasena
      );
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

  // Obtener todos los usuarios (solo para administración)
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

  // Insertar intereses del usuario
  private async insertUserInterests(userId: number, interestIds: number[]): Promise<void> {
    const { AppDataSource } = await import("../config/ormconfig");
    const usuarioInteresesRepo = AppDataSource.getRepository(UsuarioInteresesEntity);

    const inserts = interestIds.map(interestId => ({
      usuario: { idUsuario: userId },
      interes: { idInteres: interestId }
    }));

    await usuarioInteresesRepo.save(inserts);
  }

  // Insertar distracciones del usuario
  private async insertUserDistractions(userId: number, distractionIds: number[]): Promise<void> {
    const { AppDataSource } = await import("../config/ormconfig");
    const usuarioDistraccionesRepo = AppDataSource.getRepository(UsuarioDistraccionesEntity);

    const inserts = distractionIds.map(distractionId => ({
      usuario: { idUsuario: userId },
      distraccion: { idDistraccion: distractionId }
    }));

    await usuarioDistraccionesRepo.save(inserts);
  }

  // Insertar intereses del usuario en transacción
  private async insertUserInterestsInTransaction(queryRunner: any, userId: number, interestIds: number[]): Promise<void> {
    const inserts = interestIds.map(interestId => ({
      idUsuario: userId,
      idInteres: interestId
    }));

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into("usuariointereses")
      .values(inserts)
      .execute();
  }

  // Insertar distracciones del usuario en transacción
  private async insertUserDistractionsInTransaction(queryRunner: any, userId: number, distractionIds: number[]): Promise<void> {
    const inserts = distractionIds.map(distractionId => ({
      idUsuario: userId,
      idDistraccion: distractionId
    }));

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into("usuariodistracciones")
      .values(inserts)
      .execute();
  }
}

export const userService = new UserService();
