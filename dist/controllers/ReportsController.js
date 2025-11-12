"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = exports.ReportsController = void 0;
const ReportsService_1 = require("../services/ReportsService");
const logger_1 = __importDefault(require("../utils/logger"));
class ReportsController {
    async createActiveMethod(req, res) {
        try {
            const userPayload = req.user;
            const { idMetodo } = req.body;
            if (!idMetodo || typeof idMetodo !== 'number') {
                const response = {
                    success: false,
                    message: "ID del método es requerido y debe ser un número",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await ReportsService_1.reportsService.createActiveMethod({
                idMetodo,
                idUsuario: userPayload.userId,
            });
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al crear método activo",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: result.message || "Método activo creado exitosamente",
                data: result.metodoRealizado,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.createActiveMethod:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getUserReports(req, res) {
        try {
            const userPayload = req.user;
            const result = await ReportsService_1.reportsService.getUserReports(userPayload.userId);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener reportes",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Reportes obtenidos exitosamente",
                data: result.reports,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.getUserReports:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateMethodProgress(req, res) {
        try {
            const userPayload = req.user;
            const methodId = parseInt(req.params.id);
            const { progreso, finalizar } = req.body;
            if (isNaN(methodId)) {
                const response = {
                    success: false,
                    message: "ID del método inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            if (progreso === undefined && finalizar === undefined) {
                const response = {
                    success: false,
                    message: "Debe proporcionar al menos un campo para actualizar (progreso o finalizar)",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            if (progreso !== undefined && ![0, 50, 100].includes(progreso)) {
                const response = {
                    success: false,
                    message: "El progreso debe ser 0, 50 o 100",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await ReportsService_1.reportsService.updateMethodProgress(methodId, userPayload.userId, {
                progreso,
                finalizar,
            });
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al actualizar progreso del método",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: result.message || "Progreso del método actualizado exitosamente",
                data: result.metodoRealizado,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.updateMethodProgress:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateSessionProgress(req, res) {
        try {
            const userPayload = req.user;
            const sessionId = parseInt(req.params.id);
            const { estado } = req.body;
            if (isNaN(sessionId)) {
                const response = {
                    success: false,
                    message: "ID de la sesión inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            if (estado === undefined) {
                const response = {
                    success: false,
                    message: "Debe proporcionar al menos un campo para actualizar (estado)",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const validEstados = ["pendiente", "en_proceso", "completada", "cancelada"];
            if (estado !== undefined && !validEstados.includes(estado)) {
                const response = {
                    success: false,
                    message: `El estado debe ser uno de: ${validEstados.join(", ")}`,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await ReportsService_1.reportsService.updateSessionProgress(sessionId, userPayload.userId, {
                estado,
            });
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al actualizar progreso de la sesión",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: result.message || "Progreso de la sesión actualizado exitosamente",
                data: result.sesionRealizada,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.updateSessionProgress:", error);
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
exports.ReportsController = ReportsController;
exports.reportsController = new ReportsController();
