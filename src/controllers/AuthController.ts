import { Request, Response } from "express";
import { emailVerificationService } from "../services/EmailVerificationService";
import { ApiResponse } from "../types/ApiResponse";
import logger from "../utils/logger";

/**
 * Controlador para la gestión de autenticación y verificación de emails
 * Maneja solicitudes de códigos de verificación, validación y registro de usuarios
 */
export class AuthController {
  /**
   * Solicita un código de verificación para un email
   * Envía un código de 6 dígitos al email proporcionado para iniciar el proceso de registro
   */
  async requestVerificationCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await emailVerificationService.requestVerificationCode(email);

      const response: ApiResponse = {
        success: result.success,
        message: result.message || "Error al solicitar código de verificación",
        error: result.error,
        timestamp: new Date(),
      };

      res.status(result.success ? 200 : 400).json(response);
    } catch (error) {
      logger.error("Error en AuthController.requestVerificationCode:", error);

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
   * Verifica un código de verificación
   * Valida que el código proporcionado sea correcto y no haya expirado
   */
  async verifyCode(req: Request, res: Response) {
    try {
      const { email, codigo } = req.body;

      const result = await emailVerificationService.verifyCode(email, codigo);

      const response: ApiResponse = {
        success: result.success,
        message: result.message || "Error al verificar código",
        error: result.error,
        timestamp: new Date(),
      };

      res.status(result.success ? 200 : 400).json(response);
    } catch (error) {
      logger.error("Error en AuthController.verifyCode:", error);

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
   * Registra un nuevo usuario después de verificar el email
   * Crea la cuenta de usuario solo si el email ha sido previamente verificado
   */
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      const result = await emailVerificationService.registerUser(email, username, password);

      const response: ApiResponse = {
        success: result.success,
        message: result.message || "Error al registrar usuario",
        data: result.user,
        error: result.error,
        timestamp: new Date(),
      };

      res.status(result.success ? 201 : 400).json(response);
    } catch (error) {
      logger.error("Error en AuthController.register:", error);

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

export const authController = new AuthController();