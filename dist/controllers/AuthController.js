"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const EmailVerificationService_1 = require("../services/EmailVerificationService");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    async requestVerificationCode(req, res) {
        try {
            const { email } = req.body;
            const result = await EmailVerificationService_1.emailVerificationService.requestVerificationCode(email);
            const response = {
                success: result.success,
                message: result.message || "Error al solicitar código de verificación",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en AuthController.requestVerificationCode:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async verifyCode(req, res) {
        try {
            const { email, codigo } = req.body;
            const result = await EmailVerificationService_1.emailVerificationService.verifyCode(email, codigo);
            const response = {
                success: result.success,
                message: result.message || "Error al verificar código",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en AuthController.verifyCode:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async register(req, res) {
        try {
            const { email, username, password } = req.body;
            const result = await EmailVerificationService_1.emailVerificationService.registerUser(email, username, password);
            const response = {
                success: result.success,
                message: result.message || "Error al registrar usuario",
                data: result.user,
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 201 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en AuthController.register:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
