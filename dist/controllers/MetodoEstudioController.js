"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metodoEstudioController = exports.MetodoEstudioController = void 0;
const MetodoEstudioService_1 = require("../services/MetodoEstudioService");
const logger_1 = __importDefault(require("../utils/logger"));
class MetodoEstudioController {
    async createMetodoEstudio(req, res) {
        try {
            const metodoData = req.body;
            const result = await MetodoEstudioService_1.metodoEstudioService.createMetodoEstudio(metodoData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: result.message || "Error al crear método de estudio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Método de estudio creado exitosamente",
                data: result.metodo,
                timestamp: new Date(),
            };
            res.status(201).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.createMetodoEstudio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getMetodoEstudioById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await MetodoEstudioService_1.metodoEstudioService.getMetodoEstudioById(id);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener método de estudio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(404).json(response);
            }
            const response = {
                success: true,
                message: "Método de estudio encontrado",
                data: result.metodo,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.getMetodoEstudioById:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async updateMetodoEstudio(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const updateData = req.body;
            const result = await MetodoEstudioService_1.metodoEstudioService.updateMetodoEstudio(id, updateData);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al actualizar método de estudio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const response = {
                success: true,
                message: "Método de estudio actualizado exitosamente",
                data: result.metodo,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.updateMetodoEstudio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async deleteMetodoEstudio(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                const response = {
                    success: false,
                    message: "ID inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await MetodoEstudioService_1.metodoEstudioService.deleteMetodoEstudio(id);
            const response = {
                success: result.success,
                message: result.success ? "Método de estudio eliminado correctamente" : "Error eliminando método de estudio",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 404).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.deleteMetodoEstudio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getAllMetodosEstudio(req, res) {
        try {
            const result = await MetodoEstudioService_1.metodoEstudioService.getAllMetodosEstudio();
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener métodos de estudio",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Métodos de estudio obtenidos exitosamente",
                data: result.metodos,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.getAllMetodosEstudio:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async getBeneficiosForMetodo(req, res) {
        try {
            const idMetodo = parseInt(req.params.id);
            if (isNaN(idMetodo)) {
                const response = {
                    success: false,
                    message: "ID de método inválido",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await MetodoEstudioService_1.metodoEstudioService.getBeneficiosForMetodo(idMetodo);
            if (!result.success) {
                const response = {
                    success: false,
                    message: "Error al obtener beneficios",
                    error: result.error,
                    timestamp: new Date(),
                };
                return res.status(500).json(response);
            }
            const response = {
                success: true,
                message: "Beneficios obtenidos exitosamente",
                data: result.beneficios,
                timestamp: new Date(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.getBeneficiosForMetodo:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async addBeneficioToMetodo(req, res) {
        try {
            const idMetodo = parseInt(req.params.id_metodo);
            const idBeneficio = parseInt(req.params.id_beneficio);
            if (isNaN(idMetodo) || isNaN(idBeneficio)) {
                const response = {
                    success: false,
                    message: "IDs inválidos",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await MetodoEstudioService_1.metodoEstudioService.addBeneficioToMetodo(idMetodo, idBeneficio);
            const response = {
                success: result.success,
                message: result.success ? "Beneficio asociado correctamente" : "Error asociando beneficio",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 400).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.addBeneficioToMetodo:", error);
            const response = {
                success: false,
                message: "Error interno del servidor",
                error: "Ocurrió un error inesperado",
                timestamp: new Date(),
            };
            res.status(500).json(response);
        }
    }
    async removeBeneficioFromMetodo(req, res) {
        try {
            const idMetodo = parseInt(req.params.id_metodo);
            const idBeneficio = parseInt(req.params.id_beneficio);
            if (isNaN(idMetodo) || isNaN(idBeneficio)) {
                const response = {
                    success: false,
                    message: "IDs inválidos",
                    timestamp: new Date(),
                };
                return res.status(400).json(response);
            }
            const result = await MetodoEstudioService_1.metodoEstudioService.removeBeneficioFromMetodo(idMetodo, idBeneficio);
            const response = {
                success: result.success,
                message: result.success ? "Beneficio removido correctamente" : "Error removiendo beneficio",
                error: result.error,
                timestamp: new Date(),
            };
            res.status(result.success ? 200 : 404).json(response);
        }
        catch (error) {
            logger_1.default.error("Error en MetodoEstudioController.removeBeneficioFromMetodo:", error);
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
exports.MetodoEstudioController = MetodoEstudioController;
exports.metodoEstudioController = new MetodoEstudioController();
