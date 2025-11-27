"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const SessionService_1 = require("../services/SessionService");
const NotificationService_1 = require("../services/NotificationService");
const logger_1 = __importDefault(require("../utils/logger"));
class SessionController {
    constructor() {
        this.sessionService = new SessionService_1.SessionService();
        this.notificationService = new NotificationService_1.NotificationService();
    }
    async createSession(req, res) {
        try {
            const userId = req.user.userId;
            const dto = req.body;
            logger_1.default.info(`Creando sesión para usuario ${userId}`, { dto });
            if (!dto.type || !["rapid", "scheduled"].includes(dto.type)) {
                const response = {
                    success: false,
                    message: "Tipo de sesión inválido. Debe ser 'rapid' o 'scheduled'",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            const session = await this.sessionService.createSession(dto, userId);
            const response = {
                success: true,
                message: "Sesión creada exitosamente",
                data: session,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error("Error creando sesión:", error);
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getSession(req, res) {
        try {
            const userId = req.user.userId;
            const sessionId = parseInt(req.params.sessionId);
            if (isNaN(sessionId)) {
                const response = {
                    success: false,
                    message: "ID de sesión inválido",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            const session = await this.sessionService.getSession(sessionId, userId);
            const response = {
                success: true,
                message: "Sesión obtenida exitosamente",
                data: session,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error(`Error obteniendo sesión ${req.params.sessionId}:`, error);
            let statusCode = 500;
            if (error.message.includes("no encontrada")) {
                statusCode = 404;
            }
            else if (error.message.includes("no pertenece")) {
                statusCode = 403;
            }
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(statusCode).json(response);
        }
    }
    async listUserSessions(req, res) {
        try {
            const tokenUserId = req.user.userId;
            const requestedUserId = parseInt(req.params.userId);
            if (tokenUserId !== requestedUserId) {
                const response = {
                    success: false,
                    message: "No tienes permisos para ver las sesiones de este usuario",
                    timestamp: new Date(),
                };
                res.status(403).json(response);
                return;
            }
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
            if (page < 1 || perPage < 1 || perPage > 100) {
                const response = {
                    success: false,
                    message: "Parámetros de paginación inválidos",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            const result = await this.sessionService.listUserSessionsPaginated(requestedUserId, page, perPage);
            const response = {
                success: true,
                message: "Sesiones obtenidas exitosamente",
                data: result,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error(`Error listando sesiones para usuario ${req.params.userId}:`, error);
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateSession(req, res) {
        try {
            const userId = req.user.userId;
            const sessionId = parseInt(req.params.sessionId);
            const dto = req.body;
            if (isNaN(sessionId)) {
                const response = {
                    success: false,
                    message: "ID de sesión inválido",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            logger_1.default.info(`Actualizando sesión ${sessionId} para usuario ${userId}`, { dto });
            const session = await this.sessionService.updateSession(sessionId, dto, userId);
            const response = {
                success: true,
                message: "Sesión actualizada exitosamente",
                data: session,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error(`Error actualizando sesión ${req.params.sessionId}:`, error);
            let statusCode = 500;
            if (error.message.includes("no encontrada")) {
                statusCode = 404;
            }
            else if (error.message.includes("no pertenece")) {
                statusCode = 403;
            }
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(statusCode).json(response);
        }
    }
    async getPendingAgedSessions(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 7;
            if (isNaN(days) || days <= 0) {
                const response = {
                    success: false,
                    message: "Parámetro 'days' inválido",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            logger_1.default.info(`Obteniendo sesiones pendientes más antiguas que ${days} días`);
            const sessions = await this.sessionService.getPendingSessionsOlderThan(days);
            const response = {
                success: true,
                message: "Sesiones pendientes obtenidas exitosamente",
                data: sessions,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error obteniendo sesiones pendientes antiguas:", error);
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async createSessionFromEvent(req, res) {
        try {
            const userId = req.user.userId;
            const eventId = parseInt(req.params.eventId);
            if (isNaN(eventId)) {
                const response = {
                    success: false,
                    message: "ID de evento inválido",
                    timestamp: new Date(),
                };
                res.status(400).json(response);
                return;
            }
            logger_1.default.info(`Creando sesión desde evento ${eventId} para usuario ${userId}`);
            const session = await this.sessionService.createSessionFromEvent(eventId, userId);
            const response = {
                success: true,
                message: "Sesión creada exitosamente desde el evento",
                data: session,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error(`Error creando sesión desde evento ${req.params.eventId}:`, error);
            let statusCode = 500;
            if (error.message.includes("no encontrado")) {
                statusCode = 404;
            }
            else if (error.message.includes("no pertenece")) {
                statusCode = 403;
            }
            else if (error.message.includes("tipo concentración") || error.message.includes("ya existe")) {
                statusCode = 400;
            }
            const response = {
                success: false,
                message: error.message || "Error interno del servidor",
                timestamp: new Date(),
            };
            res.status(statusCode).json(response);
        }
    }
}
exports.SessionController = SessionController;
