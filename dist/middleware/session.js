"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimisticConcurrencyCheck = exports.snakeToCamelCase = exports.checkSessionOwnership = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const checkSessionOwnership = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const sessionId = parseInt(req.params.sessionId);
        if (!userId) {
            const response = {
                success: false,
                message: "Usuario no autenticado",
                timestamp: new Date(),
            };
            res.status(401).json(response);
            return;
        }
        if (isNaN(sessionId)) {
            const response = {
                success: false,
                message: "ID de sesión inválido",
                timestamp: new Date(),
            };
            res.status(400).json(response);
            return;
        }
        req.sessionOwnership = {
            userId,
            sessionId,
            isOwner: true,
        };
        logger_1.default.info(`Verificación de propiedad de sesión ${sessionId} para usuario ${userId}`);
        next();
    }
    catch (error) {
        logger_1.default.error("Error en middleware de propiedad de sesión:", error);
        const response = {
            success: false,
            message: "Error interno del servidor",
            timestamp: new Date(),
        };
        res.status(500).json(response);
    }
};
exports.checkSessionOwnership = checkSessionOwnership;
const snakeToCamelCase = (req, res, next) => {
    try {
        if (req.body && typeof req.body === "object") {
            req.body = convertKeysToCamelCase(req.body);
            logger_1.default.debug("Body convertido de snake_case a camelCase");
        }
        if (req.query && typeof req.query === "object") {
            req.query = convertKeysToCamelCase(req.query);
            logger_1.default.debug("Query convertido de snake_case a camelCase");
        }
        next();
    }
    catch (error) {
        logger_1.default.error("Error convirtiendo snake_case a camelCase:", error);
        next();
    }
};
exports.snakeToCamelCase = snakeToCamelCase;
function convertKeysToCamelCase(obj) {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToCamelCase);
    }
    const converted = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            converted[camelKey] = convertKeysToCamelCase(obj[key]);
        }
    }
    return converted;
}
const optimisticConcurrencyCheck = (req, res, next) => {
    try {
        const updatedAt = req.body?.updatedAt || req.body?.fechaActualizacion;
        if (updatedAt) {
            const date = new Date(updatedAt);
            if (isNaN(date.getTime())) {
                const response = {
                    success: false,
                    message: "Formato de fecha de actualización inválido",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            req.concurrencyCheck = {
                updatedAt: date,
            };
            logger_1.default.debug(`Verificación de concurrencia optimista con updatedAt: ${date.toISOString()}`);
        }
        next();
    }
    catch (error) {
        logger_1.default.error("Error en middleware de concurrencia optimista:", error);
        const response = {
            success: false,
            message: "Error interno del servidor",
            timestamp: new Date(),
        };
        res.status(500).json(response);
    }
};
exports.optimisticConcurrencyCheck = optimisticConcurrencyCheck;
