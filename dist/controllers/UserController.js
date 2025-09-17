"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const jwt_1 = require("../utils/jwt");
class UserController {
    async createUser(req, res) {
        try {
            const userData = req.body;
            const result = await UserService_1.userService.createUser(userData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al crear usuario",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Usuario creado exitosamente",
                data: result.user,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error("Error en UserController.createUser:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
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
            console.error("Error en UserController.getUserById:", error);
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
            console.error("Error en UserController.getUserByEmail:", error);
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
            console.error("Error en UserController.updateUser:", error);
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
            const { email, password } = req.body;
            if (!email || !password) {
                const response = {
                    success: false,
                    message: "Email y contraseña son requeridos",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await UserService_1.userService.verifyCredentials(email, password);
            if (!result.success || !result.user) {
                const response = {
                    success: false,
                    message: "Error de autenticación",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(401).json(response);
            }
            const tokenPayload = {
                userId: result.user.id_usuario,
                email: result.user.correo,
            };
            const accessToken = jwt_1.JwtUtils.generateAccessToken(tokenPayload);
            const refreshToken = jwt_1.JwtUtils.generateRefreshToken(tokenPayload);
            const response = {
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
        }
        catch (error) {
            console.error("Error en UserController.login:", error);
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
            console.error("Error en UserController.getProfile:", error);
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
            console.error("Error en UserController.getAllUsers:", error);
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
exports.UserController = UserController;
exports.userController = new UserController();
