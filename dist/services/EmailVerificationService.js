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
exports.emailVerificationService = exports.EmailVerificationService = void 0;
const CodigosVerificacionRepository_1 = require("../repositories/CodigosVerificacionRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const mailer_1 = require("../utils/mailer");
const validation_1 = require("../utils/validation");
const logger_1 = __importDefault(require("../utils/logger"));
class EmailVerificationService {
    static generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    static getExpirationDate() {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + this.EXPIRATION_MINUTES);
        return expirationDate;
    }
    async requestVerificationCode(email) {
        try {
            if (!validation_1.ValidationUtils.isValidEmail(email)) {
                return { success: false, error: "Formato de email inválido" };
            }
            const existingCode = await CodigosVerificacionRepository_1.codigosVerificacionRepository.findActiveByEmail(email);
            let verificationCode;
            let expirationDate;
            if (existingCode) {
                verificationCode = existingCode.codigo;
                expirationDate = existingCode.expiraEn;
                logger_1.default.info(`Reutilizando código de verificación existente para email: ${email}`);
            }
            else {
                verificationCode = EmailVerificationService.generateVerificationCode();
                expirationDate = EmailVerificationService.getExpirationDate();
                await CodigosVerificacionRepository_1.codigosVerificacionRepository.createVerificationCode({
                    email: email.toLowerCase(),
                    codigo: verificationCode,
                    expiraEn: expirationDate,
                });
                logger_1.default.info(`Nuevo código de verificación creado para email: ${email}`);
            }
            await (0, mailer_1.sendVerificationEmail)(email, verificationCode);
            return {
                success: true,
                message: "Código de verificación enviado exitosamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en EmailVerificationService.requestVerificationCode:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor"
            };
        }
    }
    async verifyCode(email, codigo) {
        try {
            if (!validation_1.ValidationUtils.isValidEmail(email)) {
                return { success: false, error: "Formato de email inválido" };
            }
            const verificationCode = await CodigosVerificacionRepository_1.codigosVerificacionRepository.findActiveByEmail(email);
            if (!verificationCode) {
                return { success: false, error: "No se encontró un código de verificación activo para este email" };
            }
            if (CodigosVerificacionRepository_1.codigosVerificacionRepository.isCodeExpired(verificationCode.expiraEn)) {
                return { success: false, error: "El código de verificación ha expirado" };
            }
            if (verificationCode.intentos >= EmailVerificationService.MAX_ATTEMPTS) {
                return { success: false, error: "Se ha excedido el número máximo de intentos" };
            }
            if (verificationCode.codigo !== codigo) {
                await CodigosVerificacionRepository_1.codigosVerificacionRepository.incrementAttempts(verificationCode.id);
                const remainingAttempts = EmailVerificationService.MAX_ATTEMPTS - verificationCode.intentos - 1;
                return {
                    success: false,
                    error: `Código incorrecto. Intentos restantes: ${remainingAttempts}`
                };
            }
            return {
                success: true,
                message: "Email verificado exitosamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en EmailVerificationService.verifyCode:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor"
            };
        }
    }
    async registerUser(email, username, password) {
        try {
            if (!validation_1.ValidationUtils.isValidEmail(email)) {
                return { success: false, error: "Formato de email inválido" };
            }
            const verificationCode = await CodigosVerificacionRepository_1.codigosVerificacionRepository.findActiveByEmail(email);
            if (!verificationCode) {
                return { success: false, error: "El email no ha sido verificado" };
            }
            if (CodigosVerificacionRepository_1.codigosVerificacionRepository.isCodeExpired(verificationCode.expiraEn)) {
                return { success: false, error: "La verificación del email ha expirado" };
            }
            if (!validation_1.ValidationUtils.isValidUsername(username)) {
                return {
                    success: false,
                    error: "El nombre de usuario solo puede contener letras, números, guiones bajos (_) y guiones (-), sin espacios"
                };
            }
            if (!validation_1.ValidationUtils.isValidPassword(password)) {
                return {
                    success: false,
                    error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número"
                };
            }
            const existingUser = await UserRepository_1.userRepository.findByEmail(email);
            if (existingUser) {
                return { success: false, error: "El email ya está registrado" };
            }
            const existingUsername = await UserRepository_1.userRepository.findByUsername(username);
            if (existingUsername) {
                return { success: false, error: "El nombre de usuario ya está en uso" };
            }
            const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
            const hashedPassword = await bcrypt.hash(password, Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12"));
            const newUser = await UserRepository_1.userRepository.create({
                nombre_usuario: validation_1.ValidationUtils.sanitizeText(username),
                correo: email.toLowerCase().trim(),
                contrasena: hashedPassword,
            });
            await CodigosVerificacionRepository_1.codigosVerificacionRepository.deleteByEmail(email);
            logger_1.default.info(`Usuario registrado exitosamente: ${username} (${email})`);
            return {
                success: true,
                user: newUser,
                message: "Usuario registrado exitosamente"
            };
        }
        catch (error) {
            logger_1.default.error("Error en EmailVerificationService.registerUser:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor"
            };
        }
    }
    async cleanupExpiredCodes() {
        try {
            const deletedCount = await CodigosVerificacionRepository_1.codigosVerificacionRepository.cleanupExpiredCodes();
            logger_1.default.info(`Códigos expirados eliminados: ${deletedCount}`);
            return {
                success: true,
                deletedCount,
                message: `Se eliminaron ${deletedCount} códigos expirados`
            };
        }
        catch (error) {
            logger_1.default.error("Error en EmailVerificationService.cleanupExpiredCodes:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error interno del servidor"
            };
        }
    }
}
exports.EmailVerificationService = EmailVerificationService;
EmailVerificationService.MAX_ATTEMPTS = 5;
EmailVerificationService.EXPIRATION_MINUTES = 10;
exports.emailVerificationService = new EmailVerificationService();
