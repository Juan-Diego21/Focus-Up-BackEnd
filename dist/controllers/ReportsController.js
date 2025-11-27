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
            const { id_metodo, estado, progreso } = req.body;
            const metodoId = Number(id_metodo);
            if (!id_metodo || isNaN(metodoId)) {
                const response = {
                    success: false,
                    message: "ID del método es requerido y debe ser un número",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await ReportsService_1.reportsService.createActiveMethod({
                idMetodo: metodoId,
                estado: estado || "en_progreso",
                progreso: progreso || 0,
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
            const metodoData = result.metodoRealizado;
            if (!metodoData) {
                const response = {
                    success: false,
                    message: "Error interno: no se pudo obtener el método creado",
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: result.message || "Método activo creado exitosamente",
                data: {
                    id_metodo_realizado: metodoData.idMetodoRealizado,
                    id_usuario: metodoData.idUsuario,
                    id_metodo: metodoData.idMetodo,
                    progreso: metodoData.progreso,
                    estado: metodoData.estado,
                    fecha_inicio: metodoData.fechaInicio,
                    fecha_fin: metodoData.fechaFin,
                    fecha_creacion: metodoData.fechaCreacion,
                    fecha_actualizacion: metodoData.fechaActualizacion,
                },
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.createActiveMethod:", JSON.stringify(error));
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
            const { userId: queryUserId } = req.query;
            const targetUserId = queryUserId ? parseInt(queryUserId) : userPayload.userId;
            if (isNaN(targetUserId)) {
                const response = {
                    success: false,
                    message: "ID de usuario inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const [sessionsResult, methodsResult] = await Promise.all([
                ReportsService_1.reportsService.getUserSessionReports(targetUserId),
                ReportsService_1.reportsService.getUserMethodReports(targetUserId)
            ]);
            if (!sessionsResult.success || !methodsResult.success) {
                const error = sessionsResult.error || methodsResult.error || "Error al obtener reportes";
                const response = {
                    success: false,
                    message: "Error al obtener reportes",
                    error: error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Reportes obtenidos exitosamente (DEPRECATED: use /reports/sessions y /reports/methods)",
                data: {
                    sessions: sessionsResult.sessions || [],
                    methods: methodsResult.methods || []
                },
                timestamp: new Date(),
            };
            res.set('X-Deprecated', 'true');
            res.set('X-Deprecation-Message', 'Use GET /api/v1/reports/sessions and GET /api/v1/reports/methods instead');
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.getUserReports:", JSON.stringify(error));
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
            logger_1.default.error("Error en ReportsController.updateMethodProgress:", JSON.stringify(error));
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
            const { status, elapsedMs, notes, estado, duracion } = req.body;
            if (isNaN(sessionId)) {
                const response = {
                    success: false,
                    message: "ID de la sesión inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const finalStatus = status || estado;
            const finalElapsedMs = elapsedMs !== undefined ? elapsedMs : duracion;
            if (!finalStatus || !["completed", "pending"].includes(finalStatus)) {
                const response = {
                    success: false,
                    message: "Status inválido. Debe ser 'completed' o 'pending'",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            if (finalElapsedMs !== undefined && (typeof finalElapsedMs !== 'number' || finalElapsedMs < 0)) {
                const response = {
                    success: false,
                    message: "elapsedMs/duracion debe ser un número positivo",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            logger_1.default.info(`Actualizando progreso de sesión ${sessionId} para usuario ${userPayload.userId}`, {
                status: finalStatus,
                elapsedMs: finalElapsedMs,
                notes
            });
            const result = await ReportsService_1.reportsService.updateSessionProgress(sessionId, userPayload.userId, {
                status: finalStatus,
                elapsedMs: finalElapsedMs,
                notes
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
                data: result.session,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.updateSessionProgress:", JSON.stringify(error));
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getUserSessionReports(req, res) {
        try {
            const userPayload = req.user;
            const result = await ReportsService_1.reportsService.getUserSessionReports(userPayload.userId);
            if (!result.success) {
                if (result.error === "Usuario no encontrado") {
                    const response = {
                        success: false,
                        message: "Usuario no encontrado",
                        error: result.error,
                        timestamp: new Date(),
                    };
                    return res.status(404).json(response);
                }
                const response = {
                    success: false,
                    message: "Error al obtener reportes de sesiones",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: result.sessions.length > 0 ? "Reportes de sesiones obtenidos exitosamente" : "No se encontraron sesiones para este usuario",
                data: result.sessions,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.getUserSessionReports:", JSON.stringify(error));
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getUserMethodReports(req, res) {
        try {
            const userPayload = req.user;
            const result = await ReportsService_1.reportsService.getUserMethodReports(userPayload.userId);
            if (!result.success) {
                if (result.error === "Usuario no encontrado") {
                    const response = {
                        success: false,
                        message: "Usuario no encontrado",
                        error: result.error,
                        timestamp: new Date(),
                    };
                    return res.status(404).json(response);
                }
                const response = {
                    success: false,
                    message: "Error al obtener reportes de métodos",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: result.methods.length > 0 ? "Reportes de métodos obtenidos exitosamente" : "No se encontraron métodos para este usuario",
                data: result.methods,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.getUserMethodReports:", JSON.stringify(error));
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async deleteReport(req, res) {
        try {
            const userPayload = req.user;
            const reportId = parseInt(req.params.id);
            if (isNaN(reportId)) {
                const response = {
                    success: false,
                    message: "ID del reporte inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await ReportsService_1.reportsService.deleteReport(reportId, userPayload.userId);
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al eliminar reporte",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: result.message || "Reporte eliminado correctamente",
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en ReportsController.deleteReport:", JSON.stringify(error));
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
