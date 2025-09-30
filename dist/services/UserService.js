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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const validation_1 = require("../utils/validation");
class UserService {
    static async hashPassword(password) {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    static async verifyPassword(plainPassword, hashedPassword) {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    async createUser(userData) {
        try {
            if (!validation_1.ValidationUtils.isValidEmail(userData.correo)) {
                return { success: false, error: 'Formato de email inválido' };
            }
            if (!validation_1.ValidationUtils.isValidPassword(userData.contrasena)) {
                return { success: false, error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número' };
            }
            if (userData.horario_fav && !validation_1.ValidationUtils.isValidTime(userData.horario_fav)) {
                return { success: false, error: 'Formato de hora inválido (use HH:MM)' };
            }
            const sanitizedData = {
                ...userData,
                nombre_usuario: validation_1.ValidationUtils.sanitizeText(userData.nombre_usuario),
                pais: userData.pais ? validation_1.ValidationUtils.sanitizeText(userData.pais) : undefined,
                correo: userData.correo.toLowerCase().trim()
            };
            const emailExists = await UserRepository_1.userRepository.emailExists(sanitizedData.correo);
            if (emailExists) {
                return { success: false, error: 'El correo electrónico ya está registrado' };
            }
            const usernameExists = await UserRepository_1.userRepository.usernameExists(sanitizedData.nombre_usuario);
            if (usernameExists) {
                return { success: false, error: 'El nombre de usuario ya está en uso' };
            }
            const hashedPassword = await UserService.hashPassword(sanitizedData.contrasena);
            const user = await UserRepository_1.userRepository.create({
                ...sanitizedData,
                contrasena: hashedPassword
            });
            return { success: true, user };
        }
        catch (error) {
            console.error('Error en UserService.createUser:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            };
        }
    }
    async getUserById(id) {
        try {
            const user = await UserRepository_1.userRepository.findById(id);
            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }
            return { success: true, user };
        }
        catch (error) {
            console.error('Error en UserService.getUserById:', error);
            return { success: false, error: 'Error al obtener usuario' };
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await UserRepository_1.userRepository.findByEmail(email);
            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }
            return { success: true, user };
        }
        catch (error) {
            console.error('Error en UserService.getUserByEmail:', error);
            return { success: false, error: 'Error al obtener usuario' };
        }
    }
    async updateUser(id, updateData) {
        try {
            if (updateData.contrasena) {
                if (!validation_1.ValidationUtils.isValidPassword(updateData.contrasena)) {
                    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número' };
                }
                updateData.contrasena = await UserService.hashPassword(updateData.contrasena);
            }
            if (updateData.correo && !validation_1.ValidationUtils.isValidEmail(updateData.correo)) {
                return { success: false, error: 'Formato de email inválido' };
            }
            if (updateData.horario_fav && !validation_1.ValidationUtils.isValidTime(updateData.horario_fav)) {
                return { success: false, error: 'Formato de hora inválido (use HH:MM)' };
            }
            const sanitizedData = { ...updateData };
            if (sanitizedData.nombre_usuario) {
                sanitizedData.nombre_usuario = validation_1.ValidationUtils.sanitizeText(sanitizedData.nombre_usuario);
            }
            if (sanitizedData.pais) {
                sanitizedData.pais = validation_1.ValidationUtils.sanitizeText(sanitizedData.pais);
            }
            if (sanitizedData.correo) {
                sanitizedData.correo = sanitizedData.correo.toLowerCase().trim();
            }
            if (sanitizedData.correo) {
                const emailExists = await UserRepository_1.userRepository.emailExists(sanitizedData.correo, id);
                if (emailExists) {
                    return { success: false, error: 'El correo electrónico ya está registrado' };
                }
            }
            if (sanitizedData.nombre_usuario) {
                const usernameExists = await UserRepository_1.userRepository.usernameExists(sanitizedData.nombre_usuario, id);
                if (usernameExists) {
                    return { success: false, error: 'El nombre de usuario ya está en uso' };
                }
            }
            const user = await UserRepository_1.userRepository.update(id, sanitizedData);
            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }
            return { success: true, user };
        }
        catch (error) {
            console.error('Error en UserService.updateUser:', error);
            return { success: false, error: 'Error al actualizar usuario' };
        }
    }
    async verifyCredentials(email, password) {
        try {
            const user = await UserRepository_1.userRepository.findByEmail(email);
            if (!user) {
                return { success: false, error: 'Credenciales inválidas' };
            }
            const isValidPassword = await UserService.verifyPassword(password, user.contrasena);
            if (!isValidPassword) {
                return { success: false, error: 'Credenciales inválidas' };
            }
            const { contrasena: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };
        }
        catch (error) {
            console.error('Error en UserService.verifyCredentials:', error);
            return { success: false, error: 'Error al verificar credenciales' };
        }
    }
    async getAllUsers() {
        try {
            const users = await UserRepository_1.userRepository.findAll();
            return { success: true, users };
        }
        catch (error) {
            console.error('Error en UserService.getAllUsers:', error);
            return { success: false, error: 'Error al obtener usuarios' };
        }
    }
}
exports.UserService = UserService;
UserService.SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
exports.userService = new UserService();
