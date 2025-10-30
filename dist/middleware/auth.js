"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticateToken = (req, res, next) => {
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
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        logger_1.default.info(`Token decoded successfully for userId: ${decoded.userId}, email: ${decoded.email}`);
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
