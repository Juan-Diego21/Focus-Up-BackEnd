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
exports.passwordResetService = exports.PasswordResetService = void 0;
const PasswordReset_entity_1 = require("../models/PasswordReset.entity");
const User_entity_1 = require("../models/User.entity");
const ormconfig_1 = require("../config/ormconfig");
const mailer_1 = require("../utils/mailer");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../utils/logger"));
class PasswordResetService {
    constructor() {
        this.passwordResetRepository = ormconfig_1.AppDataSource.getRepository(PasswordReset_entity_1.PasswordResetEntity);
        this.userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
    }
    async requestPasswordReset(emailOrUsername) {
        try {
            if (!emailOrUsername) {
                logger_1.default.warn("requestPasswordReset: emailOrUsername está vacío");
                return { success: false, message: "El correo electrónico o nombre de usuario es requerido." };
            }
            logger_1.default.info(`requestPasswordReset: Buscando usuario con identificador: ${emailOrUsername}`);
            const user = await this.userRepository.findOne({
                where: [
                    { correo: emailOrUsername.toLowerCase() },
                    { nombreUsuario: emailOrUsername }
                ]
            });
            logger_1.default.info(`requestPasswordReset: Resultado de búsqueda de usuario: ${user ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
            if (user) {
                logger_1.default.info(`requestPasswordReset: Usuario encontrado - ID: ${user.idUsuario}, Email: ${user.correo}, Username: ${user.nombreUsuario}`);
            }
            if (!user) {
                logger_1.default.info(`Intento de restablecimiento para identificador no registrado: ${emailOrUsername}`);
                return { success: true, message: "Si el correo o nombre de usuario existe, recibirás un código para restablecer tu contraseña." };
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 10);
            const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
            const hashedCode = await bcrypt.hash(code, 12);
            logger_1.default.info(`requestPasswordReset: Generando código de verificación para usuario ${user.idUsuario}`);
            const passwordReset = this.passwordResetRepository.create({
                userId: user.idUsuario,
                code: hashedCode,
                expiresAt,
                used: false,
            });
            logger_1.default.info(`requestPasswordReset: Guardando registro de reset en base de datos`);
            await this.passwordResetRepository.save(passwordReset);
            logger_1.default.info(`requestPasswordReset: Registro guardado exitosamente`);
            logger_1.default.info(`requestPasswordReset: Enviando email a ${user.correo} con código ${code}`);
            await (0, mailer_1.sendResetEmail)(user.correo, user.nombreUsuario, code);
            logger_1.default.info(`requestPasswordReset: Email enviado exitosamente`);
            logger_1.default.info(`Código de restablecimiento enviado a: ${user.correo}`);
            return { success: true, message: "Si el correo o nombre de usuario existe, recibirás un código para restablecer tu contraseña." };
        }
        catch (error) {
            logger_1.default.error("Error en requestPasswordReset:", error);
            logger_1.default.error("Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return { success: false, message: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente." };
        }
    }
    async verifyResetCodeAndResetPassword(email, code, newPassword) {
        try {
            if (!email || !validation_1.ValidationUtils.isValidEmail(email)) {
                return { success: false, message: "El correo electrónico es requerido." };
            }
            if (!code || code.length !== 6) {
                return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
            }
            if (!newPassword || !validation_1.ValidationUtils.isValidPassword(newPassword)) {
                return { success: false, message: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número." };
            }
            const user = await this.userRepository.findOne({ where: { correo: email.toLowerCase() } });
            if (!user) {
                return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
            }
            const passwordReset = await this.passwordResetRepository.findOne({
                where: {
                    userId: user.idUsuario,
                    used: false,
                },
                order: { createdAt: "DESC" },
            });
            if (!passwordReset) {
                return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
            }
            if (new Date() > passwordReset.expiresAt) {
                return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
            }
            const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
            const isValidCode = await bcrypt.compare(code, passwordReset.code);
            if (!isValidCode) {
                return { success: false, message: "Código inválido o expirado. Solicita uno nuevo." };
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await this.userRepository.update(user.idUsuario, { contrasena: hashedPassword });
            await this.passwordResetRepository.update(passwordReset.id, { used: true });
            logger_1.default.info(`Contraseña restablecida exitosamente para usuario: ${user.correo}`);
            return { success: true, message: "Tu contraseña ha sido restablecida exitosamente." };
        }
        catch (error) {
            logger_1.default.error("Error en verifyResetCodeAndResetPassword:", error);
            return { success: false, message: "Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente." };
        }
    }
}
exports.PasswordResetService = PasswordResetService;
exports.passwordResetService = new PasswordResetService();
