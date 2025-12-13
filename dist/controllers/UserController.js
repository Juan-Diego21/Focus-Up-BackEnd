"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const jwt_1 = require("../utils/jwt");
const responseBuilder_1 = require("../utils/responseBuilder");
const logger_1 = __importDefault(require("../utils/logger"));
class UserController {
    async createUser(req, res) {
        try {
            const userData = req.body;
            const result = await UserService_1.userService.createUser(userData);
            if (!result.success) {
                return res.status(400).json(responseBuilder_1.ResponseBuilder.error(result.message || "Error al crear usuario", result.error));
            }
            res.status(201).json(responseBuilder_1.ResponseBuilder.success("Usuario creado exitosamente", result.user));
        }
        catch (error) {
            logger_1.default.error("Error en UserController.createUser:", error);
            res.status(500).json(responseBuilder_1.ResponseBuilder.serverError());
        }
    }
    async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                const response = {
                    success: false,
                    message: "ID de usuario inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await UserService_1.userService.getUserById(userId);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener usuario",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: "Usuario encontrado",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.getUserById:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getUserByEmail(req, res) {
        try {
            const { email } = req.params;
            if (!email) {
                const response = {
                    success: false,
                    message: "Email es requerido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await UserService_1.userService.getUserByEmail(email);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener usuario",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: "Usuario encontrado",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.getUserByEmail:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                const response = {
                    success: false,
                    message: "ID de usuario inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const updateData = req.body;
            const result = await UserService_1.userService.updateUser(userId, updateData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al actualizar usuario",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Usuario actualizado exitosamente",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.updateUser:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async login(req, res) {
        try {
            const { correo, nombre_usuario, contrasena } = req.body;
            let identifier;
            if (correo) {
                identifier = correo;
            }
            else if (nombre_usuario) {
                identifier = nombre_usuario;
            }
            if (!identifier || !contrasena) {
                const response = {
                    success: false,
                    message: "Identificador (email o nombre de usuario) y contraseña son requeridos",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await UserService_1.userService.verifyCredentials(identifier, contrasena);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Credenciales inválidas",
                    error: "El correo o la contraseña no son correctos",
                    timestamp: new Date(),
                };
                return res.status(401).json(response);
            }
            const userRepository = (await Promise.resolve().then(() => __importStar(require("../config/ormconfig")))).AppDataSource.getRepository((await Promise.resolve().then(() => __importStar(require("../models/User.entity")))).UserEntity);
            await userRepository.increment({ idUsuario: result.user.id_usuario }, "tokenVersion", 1);
            const updatedUser = await userRepository.findOne({
                where: { idUsuario: result.user.id_usuario }
            });
            const tokenVersion = updatedUser.tokenVersion;
            logger_1.default.info(`Token version incremented to ${tokenVersion} for user ${result.user.id_usuario}`);
            const tokenPayload = {
                userId: result.user.id_usuario,
                email: result.user.correo,
                tokenVersion: tokenVersion,
            };
            const accessToken = jwt_1.JwtUtils.generateAccessToken(tokenPayload);
            const response = {
                success: true,
                message: "Autenticación exitosa",
                token: accessToken,
                userId: result.user.id_usuario,
                username: result.user.nombre_usuario,
                user: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.login:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getProfile(req, res) {
        try {
            const userPayload = req.user;
            const result = await UserService_1.userService.getUserById(userPayload.userId);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener perfil",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: "Perfil obtenido exitosamente",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.getProfile:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateProfile(req, res) {
        try {
            const userPayload = req.user;
            const updateData = req.body;
            const result = await UserService_1.userService.updateUser(userPayload.userId, updateData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al actualizar perfil",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Perfil actualizado exitosamente",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.updateProfile:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async logout(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            const token = jwt_1.JwtUtils.extractTokenFromHeader(authHeader);
            if (token) {
                jwt_1.TokenBlacklistService.addToBlacklist(token);
                logger_1.default.info(`Token revocado exitosamente para logout del usuario: ${req.user?.userId}`);
            }
            const response = {
                success: true,
                message: "Sesión cerrada exitosamente",
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.logout:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getAllUsers(req, res) {
        try {
            const result = await UserService_1.userService.getAllUsers();
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener usuarios",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Usuarios obtenidos exitosamente",
                data: result.users,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.getAllUsers:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                });
            }
            const result = await UserService_1.userService.deleteUser(id);
            const response = {
                success: result.success,
                message: result.success
                    ? "Usuario eliminado correctamente"
                    : result.error || "Error eliminando usuario",
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 404).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.deleteUser:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async requestPasswordReset(req, res) {
        try {
            const { emailOrUsername } = req.body;
            if (!emailOrUsername) {
                const response = {
                    success: false,
                    message: "El correo electrónico o nombre de usuario es requerido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const { passwordResetService } = await Promise.resolve().then(() => __importStar(require("../services/PasswordResetService")));
            const result = await passwordResetService.requestPasswordReset(emailOrUsername);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.requestPasswordReset:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async resetPasswordWithCode(req, res) {
        try {
            const { email, code, newPassword } = req.body;
            if (!email || !code || !newPassword) {
                const response = {
                    success: false,
                    message: "El correo electrónico, código y nueva contraseña son requeridos",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const { passwordResetService } = await Promise.resolve().then(() => __importStar(require("../services/PasswordResetService")));
            const result = await passwordResetService.verifyResetCodeAndResetPassword(email, code, newPassword);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.resetPasswordWithCode:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async changePassword(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { currentPassword, newPassword } = req.body;
            const userPayload = req.user;
            if (isNaN(userId)) {
                const response = {
                    success: false,
                    message: "ID de usuario inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            if (userPayload.userId !== userId) {
                const response = {
                    success: false,
                    message: "No autorizado para cambiar la contraseña de este usuario",
                    timestamp: new Date(),
                };
                return res.status(403).json(response);
            }
            if (!currentPassword || !newPassword) {
                const response = {
                    success: false,
                    message: "La contraseña actual y la nueva contraseña son requeridas",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await UserService_1.userService.changePassword(userId, currentPassword, newPassword);
            const response = {
                success: result.success,
                message: result.success ? result.message : result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en UserController.changePassword:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
