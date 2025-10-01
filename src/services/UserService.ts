import { UserCreateInput, UserUpdateInput, User } from '../types/User';
import { userRepository } from '../repositories/UserRepository';
import { ValidationUtils } from '../utils/validation';
import { sendEmail } from '../utils/sendEmail';
import { PasswordResetToken } from '../types/PasswordResetToken'; // Corrige la ruta si es necesario
import { AppDataSource } from "../config/ormconfig"; // Corrige la ruta si es necesario
import crypto from 'crypto';

export class UserService {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

  private static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createUser(userData: UserCreateInput): Promise<{
    message: string; success: boolean; user?: User; error?: string 
}> {
    try {
      if (!ValidationUtils.isValidEmail(userData.correo)) {
        return { success: false, message: 'Formato de email inválido', error: 'Formato de email inválido' };
      }

      if (!ValidationUtils.isValidPassword(userData.contrasena)) {
        return { success: false, message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número', error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número' };
      }

      if (userData.horario_fav && !ValidationUtils.isValidTime(userData.horario_fav)) {
        return { success: false, message: 'Formato de hora inválido (use HH:MM)', error: 'Formato de hora inválido (use HH:MM)' };
      }

      const sanitizedData: UserCreateInput = {
        ...userData,
        nombre_usuario: ValidationUtils.sanitizeText(userData.nombre_usuario),
        pais: userData.pais ? ValidationUtils.sanitizeText(userData.pais) : undefined,
        correo: userData.correo.toLowerCase().trim()
      };

      const emailExists = await userRepository.emailExists(sanitizedData.correo);
      if (emailExists) return { success: false, message: 'El correo electrónico ya está registrado', error: 'El correo electrónico ya está registrado' };

      const usernameExists = await userRepository.usernameExists(sanitizedData.nombre_usuario);
      if (usernameExists) return { success: false, message: 'El nombre de usuario ya está en uso', error: 'El nombre de usuario ya está en uso' };

      const hashedPassword = await UserService.hashPassword(sanitizedData.contrasena);

      const user = await userRepository.create({
        ...sanitizedData,
        contrasena: hashedPassword
      });

      return { success: true, message: 'Usuario creado exitosamente', user };
    } catch (error) {
      console.error('Error en createUser:', error);
      return { success: false, message: 'Error interno del servidor', error: 'Error interno del servidor' };
    }
  }

  async getUserById(id: number): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findById(id);
      if (!user) return { success: false, error: 'Usuario no encontrado' };
      return { success: true, user };
    } catch (error) {
      console.error('Error en getUserById:', error);
      return { success: false, error: 'Error al obtener usuario' };
    }
  }

  async getUserByEmail(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return { success: false, error: 'Usuario no encontrado' };
      return { success: true, user };
    } catch (error) {
      console.error('Error en getUserByEmail:', error);
      return { success: false, error: 'Error al obtener usuario' };
    }
  }

  async updateUser(id: number, updateData: UserUpdateInput): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (updateData.contrasena) {
        if (!ValidationUtils.isValidPassword(updateData.contrasena)) {
          return { success: false, error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número' };
        }
        updateData.contrasena = await UserService.hashPassword(updateData.contrasena);
      }

      if (updateData.correo && !ValidationUtils.isValidEmail(updateData.correo)) {
        return { success: false, error: 'Formato de email inválido' };
      }

      if (updateData.horario_fav && !ValidationUtils.isValidTime(updateData.horario_fav)) {
        return { success: false, error: 'Formato de hora inválido (use HH:MM)' };
      }

      const sanitizedData: UserUpdateInput = { ...updateData };
      if (sanitizedData.nombre_usuario) sanitizedData.nombre_usuario = ValidationUtils.sanitizeText(sanitizedData.nombre_usuario);
      if (sanitizedData.pais) sanitizedData.pais = ValidationUtils.sanitizeText(sanitizedData.pais);
      if (sanitizedData.correo) sanitizedData.correo = sanitizedData.correo.toLowerCase().trim();

      if (sanitizedData.correo) {
        const emailExists = await userRepository.emailExists(sanitizedData.correo, id);
        if (emailExists) return { success: false, error: 'El correo electrónico ya está registrado' };
      }

      if (sanitizedData.nombre_usuario) {
        const usernameExists = await userRepository.usernameExists(sanitizedData.nombre_usuario, id);
        if (usernameExists) return { success: false, error: 'El nombre de usuario ya está en uso' };
      }

      const user = await userRepository.update(id, sanitizedData);
      if (!user) return { success: false, error: 'Usuario no encontrado' };

      return { success: true, user };
    } catch (error) {
      console.error('Error en updateUser:', error);
      return { success: false, error: 'Error al actualizar usuario' };
    }
  }

  async verifyCredentials(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) return { success: false, error: 'Credenciales inválidas' };

      const isValidPassword = await UserService.verifyPassword(password, user.contrasena);
      if (!isValidPassword) return { success: false, error: 'Credenciales inválidas' };

      const { contrasena: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      console.error('Error en verifyCredentials:', error);
      return { success: false, error: 'Error al verificar credenciales' };
    }
  }

  async getAllUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
    try {
      const users = await userRepository.findAll();
      return { success: true, users };
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      return { success: false, error: 'Error al obtener usuarios' };
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { success: true, message: "Si el correo existe, se enviarán instrucciones" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const repo = AppDataSource.getRepository(PasswordResetToken); // <--- Cambiado aquí
    await repo.save({ userId: user.id_usuario, token, expiresAt });

    const resetUrl = `https://tusitio.com/reset-password?token=${token}`;
    await sendEmail(user.correo, "Recupera tu contraseña", `Haz clic aquí para restablecer tu contraseña: ${resetUrl}`);

    return { success: true, message: "Si el correo existe, se enviarán instrucciones" };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const repo = AppDataSource.getRepository(PasswordResetToken); // <--- Cambiado aquí
    const record = await repo.findOne({ where: { token } });

    if (!record || record.expiresAt < new Date()) {
      return { success: false, message: "Token inválido o expirado" };
    }

    const user = await userRepository.findById(record.userId);
    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    user.contrasena = await UserService.hashPassword(newPassword);
    if (typeof user.id_usuario === 'number') {
      await userRepository.update(user.id_usuario, user);
    } else {
      return { success: false, message: "ID de usuario inválido" };
    }

    await repo.delete({ id: record.id });

    return { success: true, message: "Contraseña actualizada correctamente" };
  }

}

export const userService = new UserService();
