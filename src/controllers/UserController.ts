import { Request, Response } from "express";
import { userService } from "../services/UserService";
import { ApiResponse } from "../types/ApiResponse";
import { JwtUtils } from "../utils/jwt";
import { JwtPayload } from "../utils/jwt";
import logger from "../utils/logger";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

export class UserController {
  // Crear un nuevo usuario
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

  // Obtener usuario por ID
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

  // Obtener usuario por email
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

  // Actualizar usuario
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

  // Verificar credenciales (Login)
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        const response: ApiResponse = {
          success: false,
          message: "Identificador (email o nombre de usuario) y contraseña son requeridos",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const result = await userService.verifyCredentials(identifier, password);

      if (!result.success || !result.user) {
        const response: ApiResponse = {
          success: false,
          message: "Error de autenticación",
          error: result.error,
          timestamp: new Date(),
        };
        return res.status(401).json(response);
      }

      // Generar tokens
      const tokenPayload = {
        userId: result.user.id_usuario!,
        email: result.user.correo,
      };

      const accessToken = JwtUtils.generateAccessToken(tokenPayload);
      const refreshToken = JwtUtils.generateRefreshToken(tokenPayload);

      const response: ApiResponse = {
        success: true,
        message: "Login exitoso",
        data: {
          user: result.user,
          accessToken,
          refreshToken,
        },
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

  // Obtener perfil de usuario autenticado
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

  // Obtener todos los usuarios (solo para administración)
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
}

export const userController = new UserController();
