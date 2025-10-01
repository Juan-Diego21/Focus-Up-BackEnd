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
exports.userService = exports.UserService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const validation_1 = require("../utils/validation");
const UsuarioIntereses_entity_1 = require("../models/UsuarioIntereses.entity");
const UsuarioDistracciones_entity_1 = require("../models/UsuarioDistracciones.entity");
const User_entity_1 = require("../models/User.entity");
const logger_1 = __importDefault(require("../utils/logger"));
class UserService {
    static async hashPassword(password) {
        const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    static async verifyPassword(plainPassword, hashedPassword) {
        const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    async createUser(userData) {
        const queryRunner = (await Promise.resolve().then(() => __importStar(require("../config/ormconfig")))).AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (!validation_1.ValidationUtils.isValidUsername(userData.nombre_usuario)) {
                return {
                    success: false,
                    error: "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"
                };
            }
            if (!validation_1.ValidationUtils.isValidEmail(userData.correo)) {
                return { success: false, error: "Formato de email inválido" };
            }
            if (!validation_1.ValidationUtils.isValidPassword(userData.contrasena)) {
                return {
                    success: false,
                    error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
                };
            }
            if (userData.horario_fav &&
                !validation_1.ValidationUtils.isValidTime(userData.horario_fav)) {
                return {
                    success: false,
                    error: "Formato de hora inválido (use HH:MM)",
                };
            }
            const sanitizedData = {
                ...userData,
                nombre_usuario: validation_1.ValidationUtils.sanitizeText(userData.nombre_usuario),
                pais: userData.pais
                    ? validation_1.ValidationUtils.sanitizeText(userData.pais)
                    : undefined,
                correo: userData.correo.toLowerCase().trim(),
            };
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
            const hashedPassword = await UserService.hashPassword(sanitizedData.contrasena);
            const user = await queryRunner.manager.save(User_entity_1.UserEntity, {
                nombreUsuario: sanitizedData.nombre_usuario,
                pais: sanitizedData.pais,
                genero: sanitizedData.genero,
                fechaNacimiento: sanitizedData.fecha_nacimiento || undefined,
                horarioFav: sanitizedData.horario_fav,
                correo: sanitizedData.correo.toLowerCase(),
                contrasena: hashedPassword,
            });
            if (userData.intereses && userData.intereses.length > 0) {
                await this.insertUserInterestsInTransaction(queryRunner, user.idUsuario, userData.intereses);
            }
            if (userData.distracciones && userData.distracciones.length > 0) {
                await this.insertUserDistractionsInTransaction(queryRunner, user.idUsuario, userData.distracciones);
            }
            await queryRunner.commitTransaction();
            return { success: true, user: {
                    id_usuario: user.idUsuario,
                    nombre_usuario: user.nombreUsuario,
                    pais: user.pais,
                    genero: user.genero,
                    fecha_nacimiento: user.fechaNacimiento,
                    horario_fav: user.horarioFav,
                    correo: user.correo,
                    contrasena: user.contrasena,
                    fecha_creacion: user.fechaCreacion,
                    fecha_actualizacion: user.fechaActualizacion,
                } };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            logger_1.default.error("Error en UserService.createUser:", { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor",
            };
        }
        finally {
            await queryRunner.release();
        }
    }
    async getUserById(id) {
        try {
            const user = await UserRepository_1.userRepository.findById(id);
            if (!user) {
                return { success: false, error: "Usuario no encontrado" };
            }
            return { success: true, user };
        }
        catch (error) {
            logger_1.default.error("Error en UserService.getUserById:", error);
            return { success: false, error: "Error al obtener usuario" };
        }
    }
    async getUserByEmail(email) {
        try {
            const user = await UserRepository_1.userRepository.findByEmail(email);
            if (!user) {
                return { success: false, error: "Usuario no encontrado" };
            }
            return { success: true, user };
        }
        catch (error) {
            logger_1.default.error("Error en UserService.getUserByEmail:", error);
            return { success: false, error: "Error al obtener usuario" };
        }
    }
    async updateUser(id, updateData) {
        try {
            if (updateData.contrasena) {
                if (!validation_1.ValidationUtils.isValidPassword(updateData.contrasena)) {
                    return {
                        success: false,
                        error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número",
                    };
                }
                updateData.contrasena = await UserService.hashPassword(updateData.contrasena);
            }
            if (updateData.correo &&
                !validation_1.ValidationUtils.isValidEmail(updateData.correo)) {
                return { success: false, error: "Formato de email inválido" };
            }
            if (updateData.horario_fav &&
                !validation_1.ValidationUtils.isValidTime(updateData.horario_fav)) {
                return {
                    success: false,
                    error: "Formato de hora inválido (use HH:MM)",
                };
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
                    return {
                        success: false,
                        error: "El correo electrónico ya está registrado",
                    };
                }
            }
            if (sanitizedData.nombre_usuario) {
                const usernameExists = await UserRepository_1.userRepository.usernameExists(sanitizedData.nombre_usuario, id);
                if (usernameExists) {
                    return {
                        success: false,
                        error: "El nombre de usuario ya está en uso",
                    };
                }
            }
            const user = await UserRepository_1.userRepository.update(id, sanitizedData);
            if (!user) {
                return { success: false, error: "Usuario no encontrado" };
            }
            return { success: true, user };
        }
        catch (error) {
            logger_1.default.error("Error en UserService.updateUser:", error);
            return { success: false, error: "Error al actualizar usuario" };
        }
    }
    async verifyCredentials(identifier, password) {
        try {
            let user = await UserRepository_1.userRepository.findByEmail(identifier);
            if (!user) {
                user = await UserRepository_1.userRepository.findByUsername(identifier);
            }
            if (!user) {
                return { success: false, error: "Credenciales inválidas" };
            }
            let isValidPassword;
            try {
                isValidPassword = await UserService.verifyPassword(password, user.contrasena);
            }
            catch (error) {
                isValidPassword = password === user.contrasena;
            }
            if (!isValidPassword) {
                return { success: false, error: "Credenciales inválidas" };
            }
            const { contrasena: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };
        }
        catch (error) {
            logger_1.default.error("Error en UserService.verifyCredentials:", error);
            return { success: false, error: "Error al verificar credenciales" };
        }
    }
    async getAllUsers() {
        try {
            const users = await UserRepository_1.userRepository.findAll();
            return { success: true, users };
        }
        catch (error) {
            logger_1.default.error("Error en UserService.getAllUsers:", error);
            return { success: false, error: "Error al obtener usuarios" };
        }
    }
    async insertUserInterests(userId, interestIds) {
        const { AppDataSource } = await Promise.resolve().then(() => __importStar(require("../config/ormconfig")));
        const usuarioInteresesRepo = AppDataSource.getRepository(UsuarioIntereses_entity_1.UsuarioInteresesEntity);
        const inserts = interestIds.map(interestId => ({
            usuario: { idUsuario: userId },
            interes: { idInteres: interestId }
        }));
        await usuarioInteresesRepo.save(inserts);
    }
    async insertUserDistractions(userId, distractionIds) {
        const { AppDataSource } = await Promise.resolve().then(() => __importStar(require("../config/ormconfig")));
        const usuarioDistraccionesRepo = AppDataSource.getRepository(UsuarioDistracciones_entity_1.UsuarioDistraccionesEntity);
        const inserts = distractionIds.map(distractionId => ({
            usuario: { idUsuario: userId },
            distraccion: { idDistraccion: distractionId }
        }));
        await usuarioDistraccionesRepo.save(inserts);
    }
    async insertUserInterestsInTransaction(queryRunner, userId, interestIds) {
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
    async insertUserDistractionsInTransaction(queryRunner, userId, distractionIds) {
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
exports.UserService = UserService;
UserService.SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
exports.userService = new UserService();
