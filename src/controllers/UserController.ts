import { Request, Response } from "express";
import { userService } from "../services/UserService";
import { ApiResponse } from "../types/ApiResponse";
import { JwtUtils, JwtPayload } from "../utils/jwt";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de usuarios
 * Maneja operaciones CRUD de usuarios, autenticación y recuperación de contraseña
 */
export class UserController {
  /**
   * Crear un nuevo usuario en el sistema
   * Valida los datos de entrada y registra al usuario con sus intereses y distracciones
   */
  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;

      const result = await userService.createUser(userData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: result.message || "Error al crear usuario",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Usuario creado exitosamente",
        data: result.user,
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error("Error en UserController.createUser:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtener un usuario específico por su ID
   * Requiere autenticación y valida que el ID sea numérico
   */
  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de usuario inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await userService.getUserById(userId);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener usuario",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Usuario encontrado",
        data: result.user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.getUserById:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtener un usuario específico por su dirección de correo electrónico
   * Valida que el email esté presente en los parámetros
   */
  async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        const response: ApiResponse = {
          success: false,
          message: "Email es requerido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await userService.getUserByEmail(email);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener usuario",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Usuario encontrado",
        data: result.user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.getUserByEmail:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Actualizar la información de un usuario existente
   * Valida el ID del usuario y los datos de actualización proporcionados
   */
  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        const response: ApiResponse = {
          success: false,
          message: "ID de usuario inválido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const updateData = req.body;
      const result = await userService.updateUser(userId, updateData);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al actualizar usuario",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Usuario actualizado exitosamente",
        data: result.user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.updateUser:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Autenticar usuario mediante credenciales (login)
   * Acepta email o nombre de usuario junto con la contraseña
   * Genera y devuelve un token JWT en caso de éxito
   */
  async login(req: Request, res: Response) {
    try {
      const { correo, nombre_usuario, contrasena } = req.body;

      // Determinar el identificador: priorizar email si ambos están presentes
      let identifier: string | undefined;
      if (correo) {
        identifier = correo;
      } else if (nombre_usuario) {
        identifier = nombre_usuario;
      }

      if (!identifier || !contrasena) {
        const response: ApiResponse = {
          success: false,
          message:
            "Identificador (email o nombre de usuario) y contraseña son requeridos",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await userService.verifyCredentials(
        identifier,
        contrasena
      );

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Credenciales inválidas",
          error: "El correo o la contraseña no son correctos",
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      // Generar token
      const tokenPayload = {
        userId: result.user!.id_usuario!,
        email: result.user!.correo,
      };

      const accessToken = JwtUtils.generateAccessToken(tokenPayload);

      const response: ApiResponse = {
        success: true,
        message: "Autenticación exitosa",
        token: accessToken,
        userId: result.user!.id_usuario,
        username: result.user!.nombre_usuario,
        user: result.user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.login:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtener el perfil del usuario actualmente autenticado
   * Utiliza el token JWT para identificar al usuario
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userPayload = (req as any).user as JwtPayload;

      const result = await userService.getUserById(userPayload.userId);

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener perfil",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Perfil obtenido exitosamente",
        data: result.user,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.getProfile:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Obtener lista completa de todos los usuarios del sistema
   * Endpoint destinado únicamente para administración
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const result = await userService.getAllUsers();

      if (!result.success) {
        const response: ApiResponse = {
          success: false,
          message: "Error al obtener usuarios",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(500).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: "Usuarios obtenidos exitosamente",
        data: result.users,
        timestamp: new Date(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error en UserController.getAllUsers:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        error: "Ocurrió un error inesperado",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Eliminar un usuario del sistema por su ID
   * Operación destructiva que requiere validación del ID
   */
  async deleteUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
        timestamp: new Date(),
      });
    }

    const result = await userService.deleteUser(id);

    const response: ApiResponse = {
      success: result.success,
      message: result.success
        ? "Usuario eliminado correctamente"
        : result.error || "Error eliminando usuario",
      timestamp: new Date(),
    };

    res.status(result.success ? 200 : 404).json(response);
  }

  /**
   * Solicitar código de verificación para restablecer contraseña
   * Envía un código de 6 dígitos al email o nombre de usuario proporcionado
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { emailOrUsername } = req.body;

      if (!emailOrUsername) {
        const response: ApiResponse = {
          success: false,
          message: "El correo electrónico o nombre de usuario es requerido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const { passwordResetService } = await import("../services/PasswordResetService");
      const result = await passwordResetService.requestPasswordReset(emailOrUsername);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date(),
      };

      res.status(result.success ? 200 : 400).json(response);

    } catch (error) {
      logger.error("Error en UserController.requestPasswordReset:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }

  /**
   * Verificar código de verificación y restablecer contraseña
   * Valida el código de 6 dígitos y actualiza la contraseña del usuario
   */
  async resetPasswordWithCode(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        const response: ApiResponse = {
          success: false,
          message: "El correo electrónico, código y nueva contraseña son requeridos",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const { passwordResetService } = await import("../services/PasswordResetService");
      const result = await passwordResetService.verifyResetCodeAndResetPassword(email, code, newPassword);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        timestamp: new Date(),
      };

      res.status(result.success ? 200 : 400).json(response);

    } catch (error) {
      logger.error("Error en UserController.resetPasswordWithCode:", error);

      const response: ApiResponse = {
        success: false,
        message: "Error interno del servidor",
        timestamp: new Date(),
      };

      res.status(500).json(response);
    }
  }
}

export const userController = new UserController();
