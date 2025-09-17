import bcrypt from "bcryptjs";
import { UserCreateInput, UserUpdateInput, User } from "../types/User";
import { userRepository } from "../repositories/UserRepository";
import { ValidationUtils } from "../utils/validation";

export class UserService {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.BCRYPT_SALT_ROUNDS || "12"
  );

  // Hash de contraseña
  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verificar contraseña
  private static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Crear un nuevo usuario con validaciones Y hash de contraseña
  async createUser(
    userData: UserCreateInput
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validaciones
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
      const emailExists = await userRepository.emailExists(
        sanitizedData.correo
      );
      if (emailExists) {
        return {
          success: false,
          error: "El correo electrónico ya está registrado",
        };
      }

      // Verificar si el nombre de usuario ya existe
      const usernameExists = await userRepository.usernameExists(
        sanitizedData.nombre_usuario
      );
      if (usernameExists) {
        return {
          success: false,
          error: "El nombre de usuario ya está en uso",
        };
      }

      // Hash de la contraseña antes de crear el usuario
      const hashedPassword = await UserService.hashPassword(
        sanitizedData.contrasena
      );

      // Crear usuario con contraseña hasheada
      const user = await userRepository.create({
        ...sanitizedData,
        contrasena: hashedPassword,
      });

      return { success: true, user };
    } catch (error) {
      console.error("Error en UserService.createUser:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      };
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
      console.error("Error en UserService.getUserById:", error);
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
      console.error("Error en UserService.getUserByEmail:", error);
      return { success: false, error: "Error al obtener usuario" };
    }
  }

  // Actualizar usuario con hash de contraseña si se proporciona
  async updateUser(
    id: number,
    updateData: UserUpdateInput
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Validaciones
      if (
        updateData.correo &&
        !ValidationUtils.isValidEmail(updateData.correo)
      ) {
        return { success: false, error: "Formato de email inválido" };
      }

      if (
        updateData.contrasena &&
        !ValidationUtils.isValidPassword(updateData.contrasena)
      ) {
        return {
          success: false,
          error:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
        };
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

      // Hash de la contraseña si se está actualizando
      if (sanitizedData.contrasena) {
        sanitizedData.contrasena = await UserService.hashPassword(
          sanitizedData.contrasena
        );
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
      console.error("Error en UserService.updateUser:", error);
      return { success: false, error: "Error al actualizar usuario" };
    }
  }

  // Verificar credenciales con comparación de hash
  async verifyCredentials(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        // Mismo mensaje para no revelar si el usuario existe
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
      console.error("Error en UserService.verifyCredentials:", error);
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
      console.error("Error en UserService.getAllUsers:", error);
      return { success: false, error: "Error al obtener usuarios" };
    }
  }
}

export const userService = new UserService();
