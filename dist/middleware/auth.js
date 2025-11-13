"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const ormconfig_1 = require("../config/ormconfig");
const User_entity_1 = require("../models/User.entity");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        logger_1.default.info(`Auth header received: ${authHeader ? 'present' : 'missing'} for ${req.method} ${req.originalUrl}`);
        const token = jwt_1.JwtUtils.extractTokenFromHeader(authHeader);
        logger_1.default.info(`Token extracted: ${token ? 'present' : 'missing'}`);
        if (!token) {
            logger_1.default.warn(`Acceso no autorizado - Token faltante: ${req.method} ${req.originalUrl} desde ${req.ip}`);
            const response = {
                success: false,
                message: "Acceso no autorizado. Token requerido.",
                timestamp: new Date(),
            };
            return res.status(401).json(response);
        }
        if (jwt_1.TokenBlacklistService.isBlacklisted(token)) {
            logger_1.default.warn(`Acceso no autorizado - Token revocado: ${req.method} ${req.originalUrl} desde ${req.ip}`);
            const response = {
                success: false,
                message: "Acceso no autorizado. Sesión expirada o cerrada.",
                timestamp: new Date(),
            };
            return res.status(401).json(response);
        }
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        logger_1.default.info(`Token decoded successfully for userId: ${decoded.userId}, email: ${decoded.email}, tokenVersion: ${decoded.tokenVersion || 'not present'}`);
        const userRepository = ormconfig_1.AppDataSource.getRepository(User_entity_1.UserEntity);
        const user = await userRepository.findOne({
            where: { idUsuario: decoded.userId }
        });
        if (!user) {
            logger_1.default.warn(`Validación de token fallida - Usuario no encontrado: ${decoded.userId}`);
            const response = {
                success: false,
                message: "Acceso no autorizado. Usuario no encontrado.",
                timestamp: new Date(),
            };
            return res.status(401).json(response);
        }
        if (user.tokenVersion !== decoded.tokenVersion) {
            logger_1.default.warn(`Validación de token fallida - Desajuste de versión para usuario ${decoded.userId}: token=${decoded.tokenVersion}, actual=${user.tokenVersion}`);
            const response = {
                success: false,
                message: "Acceso no autorizado. Sesión expirada.",
                timestamp: new Date(),
            };
            return res.status(401).json(response);
        }
        logger_1.default.info(`Validación de token completada para usuario ${decoded.userId}`);
        try {
            const decodedToken = jsonwebtoken_1.default.decode(token);
            const now = Math.floor(Date.now() / 1000);
            const timeToExpiry = decodedToken.exp - now;
            logger_1.default.info(`Token validation: expires in ${Math.floor(timeToExpiry / 3600)}h ${Math.floor((timeToExpiry % 3600) / 60)}m`);
        }
        catch (error) {
            logger_1.default.warn('Could not decode token for expiration logging');
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        let reason = "desconocido";
        let statusCode = 401;
        if (error.name === "TokenExpiredError") {
            reason = "expirado";
            statusCode = 401;
        }
        else if (error.name === "JsonWebTokenError") {
            reason = "malformado";
            statusCode = 401;
        }
        else if (error.name === "NotBeforeError") {
            reason = "no válido aún";
            statusCode = 401;
        }
        else {
            statusCode = 403;
        }
        logger_1.default.warn(`Acceso no autorizado - Token ${reason}: ${req.method} ${req.originalUrl} desde ${req.ip} - Error: ${error.message}`);
        const response = {
            success: false,
            message: "Acceso no autorizado. Token inválido o expirado.",
            timestamp: new Date(),
        };
        res.status(statusCode).json(response);
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = jwt_1.JwtUtils.extractTokenFromHeader(authHeader);
    if (token) {
        try {
            const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
            req.user = decoded;
        }
        catch (error) {
            logger_1.default.warn("Token opcional inválido:", error);
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
